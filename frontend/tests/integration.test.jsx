/**
 * The checks docs/INTEGRATION_GUIDE.md section 6.2 asks for, run against the committed
 * fixtures (real snapshots of the live API). Each one guards a rule the jury checks, not
 * just a render.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { FestivalProvider } from '../src/context/FestivalContext';
import RankingsPage from '../src/pages/RankingsPage';
import GhatDetailPage from '../src/pages/GhatDetailPage';
import OfficialBriefPage from '../src/pages/OfficialBriefPage';
import LandingPage from '../src/pages/LandingPage';
import EvidenceTimeline from '../src/components/tables/EvidenceTimeline';
import { installApiMock, rankingDurga } from './apiMock';

let calls;

beforeEach(() => {
  calls = installApiMock();
});

afterEach(() => {
  cleanup();
});

function renderAt(path, element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FestivalProvider>
        <Routes>
          <Route path="/app/ghat/:id" element={element} />
          <Route path="*" element={element} />
        </Routes>
      </FestivalProvider>
    </MemoryRouter>
  );
}

describe('ranked list', () => {
  it('shows all seven ranked ghats in rank order', async () => {
    renderAt('/app/rankings', <RankingsPage />);

    await screen.findByText('Bairagarh (Sant Hirdaram) kund');

    const rows = screen.getAllByRole('row').slice(1); // drop the header row
    const named = rows.filter((r) => within(r).queryAllByText(/kund|ghat/i).length > 0);
    expect(named.length).toBeGreaterThanOrEqual(7);

    const order = rankingDurga.ranking.map((g) => g.site);
    const rendered = order.filter((site) => screen.queryByText(site) !== null);
    expect(rendered).toEqual(order);
  });

  it('keeps a ghat with no readings out of the ranking and says why', async () => {
    renderAt('/app/rankings', <RankingsPage />);

    const heading = await screen.findByText('No readings, so no rank');
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Arch Bridge ghat')).toBeInTheDocument();
    expect(
      screen.getByText(/untested ghat is not a clean ghat/i)
    ).toBeInTheDocument();

    // It must not have been given a rank number anywhere.
    const archRow = screen.getByText('Arch Bridge ghat').closest('li');
    expect(within(archRow).queryByText(/^\d+$/)).toBeNull();
  });

  it('shows Bairagarh as Low confidence with latest data 2024', async () => {
    renderAt('/app/rankings', <RankingsPage />);

    await screen.findByText('Bairagarh (Sant Hirdaram) kund');
    const row = screen.getByText('Bairagarh (Sant Hirdaram) kund').closest('tr');

    expect(within(row).getByText(/Low Confidence/i)).toBeInTheDocument();
    expect(within(row).getByText(/latest data 2024/)).toBeInTheDocument();
  });

  it('never calls a "good" recovery clean when the water is still above the limits', async () => {
    renderAt('/app/rankings', <RankingsPage />);

    await screen.findByText('Bairagarh (Sant Hirdaram) kund');
    const row = screen.getByText('Bairagarh (Sant Hirdaram) kund').closest('tr');

    // Fixture: recovery "good" with after_severity 0.4587, i.e. no worse but still breaching.
    expect(within(row).getByText(/still above limits/i)).toBeInTheDocument();
    expect(within(row).queryByText(/recovered|clean/i)).toBeNull();
  });

  it('uses the risk level the API returned, not a score threshold of its own', async () => {
    renderAt('/app/rankings', <RankingsPage />);

    await screen.findByText('Bairagarh (Sant Hirdaram) kund');
    const row = screen.getByText('Bairagarh (Sant Hirdaram) kund').closest('tr');

    // risk_score 0.5267 -> 53 of 100. A client-side "65+ is high" rule would call this Elevated.
    expect(within(row).getByText('53')).toBeInTheDocument();
    expect(within(row).getByText('High Concern')).toBeInTheDocument();
  });
});

describe('ghat detail', () => {
  it('opens a site whose name contains a slash, with the name URL-encoded', async () => {
    const site = 'Rani Kamlapati ghat / Kamla Park kund';
    const slug = 'rani-kamlapati-ghat-kamla-park-kund';

    renderAt(`/app/ghat/${slug}`, <GhatDetailPage />);

    await waitFor(() => {
      expect(calls.some((u) => u.includes('/api/ghat?site='))).toBe(true);
    });

    const ghatCall = calls.find((u) => u.includes('/api/ghat?site='));
    expect(ghatCall).toContain(encodeURIComponent(site));
    expect(ghatCall).toContain('%2F'); // the slash is encoded, never a path segment
    expect(ghatCall).not.toContain(`${site}`);
  });

  it('shows the source page beside the readings', async () => {
    renderAt('/app/ghat/bairagarh-sant-hirdaram-kund', <GhatDetailPage />);

    await waitFor(() => {
      expect(calls.some((u) => u.includes('/api/ghat?site='))).toBe(true);
    });
    await screen.findAllByText(/60/);
  });
});

describe('readings table', () => {
  const readings = [
    {
      year: 2023, phase: 'pre', parameter: 'Dissolved oxygen', value: 0.0, status: 'measured',
      value_as_printed: '0', limit: '>= 5.0 mg/l', breach: 1.0, source_page: 60,
    },
    {
      year: 2023, phase: 'during', parameter: 'BOD', value: null, status: 'missing',
      value_as_printed: '_', limit: '<= 3.0 mg/l', breach: null, source_page: 60,
    },
    {
      year: 2023, phase: 'after', parameter: 'Lead', value: null, status: 'below_detection',
      value_as_printed: 'BDL', limit: null, breach: null, source_page: 60,
    },
  ];

  it('renders a missing reading as not measured, never as 0', () => {
    render(<EvidenceTimeline readings={readings} />);

    // Both the value cell and the status chip say it, which is the point.
    expect(screen.getAllByText(/Not measured/i).length).toBeGreaterThan(0);

    // The missing BOD row must carry no number at all. The measured DO 0 on another row is a
    // real reading and stays.
    const missingRow = screen.getByText('BOD').closest('tr');
    expect(within(missingRow).queryByText('0')).toBeNull();
    expect(within(missingRow).getAllByText(/Not measured/i).length).toBeGreaterThan(0);
  });

  it('renders below detection as words, never as zero', () => {
    render(<EvidenceTimeline readings={readings} />);
    expect(screen.getAllByText(/Below detection/i).length).toBeGreaterThan(0);
  });
});

describe('brief', () => {
  it('shows the API text and toggles between English and Hindi', async () => {
    const user = (await import('@testing-library/react')).fireEvent;
    renderAt('/app/brief', <OfficialBriefPage />);

    await screen.findByText(/Visarjan Ghat Watch: Durga brief/);

    user.click(screen.getByRole('button', { name: /हिंदी/ }));
    await screen.findByText(/विसर्जन घाट वॉच/);
  });

  it('says where the text came from and that its numbers were checked', async () => {
    renderAt('/app/brief', <OfficialBriefPage />);

    await screen.findByText(/Template \(no model\)/);
    expect(screen.getByText(/Yes, against the computed data/)).toBeInTheDocument();
  });
});

describe('landing page', () => {
  it('reads the golden numbers from the API rather than the markup', async () => {
    renderAt('/', <LandingPage />);

    // Typed-in numbers came back with the v2 landing design once already. If these are
    // hardcoded again, the stub below is ignored and this test fails.
    await screen.findByText('1,524');
    expect(screen.getByText('42 / 116')).toBeInTheDocument();
    expect(screen.getByText('100 / 112')).toBeInTheDocument();
    expect(calls.some((u) => u.includes('/api/summary'))).toBe(true);
  });

  it('says nothing about clean or safe water', async () => {
    renderAt('/', <LandingPage />);
    await screen.findByText('1,524');

    const text = document.body.textContent;
    expect(text).not.toMatch(/hypox/i);      // no clinical language
    expect(text).not.toMatch(/clean/i);    // water is never described as clean
    expect(text).not.toMatch(/safe/i);     // and never as safe
  });
});
