// Operations Command Center page: live crowd density, incidents,
// sustainability metrics and an on-demand AI briefing.
import { ErrorMessage, LoadingState } from '../../components/statusMessage.js';
import { BriefingPanel } from './briefingPanel.js';
import { DensityBoard } from './densityBoard.js';
import { IncidentList } from './incidentList.js';
import { SustainabilityMeters } from './sustainabilityMeters.js';
import { useOperations } from './useOperations.js';
import { AnimatedWrapper } from '../../components/animatedWrapper.js';

/** Full operations command center route. */
export function OperationsPage(): React.JSX.Element {
  const { snapshot, snapshotError, briefing, isBriefingLoading, briefingError, generateBriefing } =
    useOperations();

  return (
    <AnimatedWrapper>
      <section aria-labelledby="operations-heading" className="stack">
        <div>
          <h1 id="operations-heading">Operations Command Center</h1>
          <p className="page-intro">
            Live operational intelligence for Estadio Azteca — zone crowd density, open incidents and
            sustainability performance, refreshed automatically.
          </p>
        </div>

        {snapshotError !== null ? <ErrorMessage message={snapshotError} /> : null}
        {snapshot === null && snapshotError === null ? (
          <LoadingState label="Loading live operations data…" />
        ) : null}

        {snapshot !== null ? (
          <>
            {/* The board refreshes silently on an interval; announce each update
                to screen readers so live data is not a purely visual change. */}
            <p className="visually-hidden" role="status">
              Live operations data updated at {new Date(snapshot.generatedAt).toLocaleTimeString()}.
            </p>
            <div className="grid-two">
              <div className="card">
                <h2>Zone crowd density</h2>
                <DensityBoard zones={snapshot.zones} />
              </div>
              <div className="card">
                <h2>Incidents</h2>
                <IncidentList incidents={snapshot.incidents} />
              </div>
            </div>

            <div className="card">
              <h2>Sustainability</h2>
              <SustainabilityMeters metrics={snapshot.sustainability} />
            </div>

            <BriefingPanel
              briefing={briefing}
              isLoading={isBriefingLoading}
              error={briefingError}
              onGenerate={() => {
                void generateBriefing();
              }}
            />
          </>
        ) : null}
      </section>
    </AnimatedWrapper>
  );
}
