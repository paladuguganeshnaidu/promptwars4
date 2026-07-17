import re
from pathlib import Path

root = Path(r"c:\Users\ganes\OneDrive\Desktop\Virtual-Prompt-war-Week-4-main")

pairs = [
    ('components/AnimatedWrapper', 'components/animatedWrapper'),
    ('components/AppLayout', 'components/appLayout'),
    ('components/EmergencyAssistButton', 'components/emergencyAssistButton'),
    ('components/EmergencyAssistModal', 'components/emergencyAssistModal'),
    ('components/ErrorBoundary', 'components/errorBoundary'),
    ('components/NotFoundPage', 'components/notFoundPage'),
    ('components/StatusMessage', 'components/statusMessage'),
    ('components/ThemeToggle', 'components/themeToggle'),
    ('contexts/ThemeContext', 'contexts/themeContext'),
    ('features/home/HomePage', 'features/home/homePage'),
    ('features/operations/OperationsPage', 'features/operations/operationsPage'),
    ('features/operations/IncidentList', 'features/operations/incidentList'),
    ('features/operations/DensityBoard', 'features/operations/densityBoard'),
    ('features/operations/BriefingPanel', 'features/operations/briefingPanel'),
    ('features/operations/SustainabilityMeters', 'features/operations/sustainabilityMeters'),
    ('features/assistant/AssistantPage', 'features/assistant/assistantPage'),
    ('features/assistant/ChatMessageList', 'features/assistant/chatMessageList'),
    ('lib/api-types', 'lib/apiTypes'),
]

exts = {'.ts', '.tsx', '.js', '.jsx'}

for base in [root / 'client', root / 'server', root / 'e2e']:
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file() or path.suffix.lower() not in exts:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception as e:
            print(f"Failed to read {path}: {e}")
            continue
        new_text = text
        for old, new in pairs:
            # replace occurrences inside quotes: '...old...' or "...old..."
            new_text = re.sub(r"(['\"])((?:[^'\"]*/)?" + re.escape(old) + r")(?:\.js|\.ts|\.tsx)?\1",
                              lambda m: f"{m.group(1)}{m.group(2).replace(old, new)}{''.join(['.js' if m.group(0).endswith('.js'+m.group(1)) else '' ])}{m.group(1)}",
                              new_text)
            # Simpler fallback: replace old with new when found in string literals
            new_text = new_text.replace(f"'{old}.js'", f"'{new}.js'")
            new_text = new_text.replace(f'"{old}.js"', f'"{new}.js"')
            new_text = new_text.replace(f"'{old}'", f"'{new}'")
            new_text = new_text.replace(f'"{old}"', f'"{new}"')
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            print(f"Updated paths in {path}")

print('Import path update complete.')
