import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BriefingPanel } from '../../src/features/operations/briefingPanel.js';

describe('BriefingPanel', () => {
  it('shows a loading state while the briefing is being generated', () => {
    render(
      <BriefingPanel
        briefing={null}
        isLoading={true}
        error={null}
        onGenerate={(): void => {
          return;
        }}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Analysing live venue data…');
    expect(screen.getByRole('button', { name: 'Generating…' })).toBeDisabled();
  });

  it('shows errors and a generated briefing when available', () => {
    render(
      <BriefingPanel
        briefing={{
          generatedAt: '2026-07-09T17:00:00.000Z',
          briefing: 'Re-route fans away from Gate 6.',
        }}
        isLoading={false}
        error="Briefing unavailable"
        onGenerate={(): void => {
          return;
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Briefing unavailable');
    expect(screen.getByText('Re-route fans away from Gate 6.')).toBeInTheDocument();
  });
});