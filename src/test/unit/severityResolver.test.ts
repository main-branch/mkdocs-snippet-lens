import * as assert from 'assert';
import { resolveDiagnosticSeverity, DiagnosticSeverity } from '../../severityResolver';

describe('SeverityResolver', () => {
  describe('resolveDiagnosticSeverity', () => {
    describe('when strictMode is "true"', () => {
      it('should return Error severity', () => {
        const severity = resolveDiagnosticSeverity('true', false);
        assert.strictEqual(severity, DiagnosticSeverity.Error);
      });

      it('should return Error regardless of check_paths value', () => {
        const severity1 = resolveDiagnosticSeverity('true', true);
        const severity2 = resolveDiagnosticSeverity('true', false);
        assert.strictEqual(severity1, DiagnosticSeverity.Error);
        assert.strictEqual(severity2, DiagnosticSeverity.Error);
      });
    });

    describe('when strictMode is "false"', () => {
      it('should return Warning severity', () => {
        const severity = resolveDiagnosticSeverity('false', true);
        assert.strictEqual(severity, DiagnosticSeverity.Warning);
      });

      it('should return Warning regardless of check_paths value', () => {
        const severity1 = resolveDiagnosticSeverity('false', true);
        const severity2 = resolveDiagnosticSeverity('false', false);
        assert.strictEqual(severity1, DiagnosticSeverity.Warning);
        assert.strictEqual(severity2, DiagnosticSeverity.Warning);
      });
    });

    describe('when strictMode is "auto"', () => {
      it('should return Error when check_paths is true', () => {
        const severity = resolveDiagnosticSeverity('auto', true);
        assert.strictEqual(severity, DiagnosticSeverity.Error);
      });

      it('should return Warning when check_paths is false', () => {
        const severity = resolveDiagnosticSeverity('auto', false);
        assert.strictEqual(severity, DiagnosticSeverity.Warning);
      });
    });

    describe('when strictMode is undefined or invalid', () => {
      it('should default to auto mode with check_paths false (Warning)', () => {
        const severity = resolveDiagnosticSeverity(undefined, false);
        assert.strictEqual(severity, DiagnosticSeverity.Warning);
      });

      it('should default to auto mode with check_paths true (Error)', () => {
        const severity = resolveDiagnosticSeverity(undefined, true);
        assert.strictEqual(severity, DiagnosticSeverity.Error);
      });

      it('should treat invalid strictMode as auto mode', () => {
        const severity1 = resolveDiagnosticSeverity('invalid' as any, false);
        const severity2 = resolveDiagnosticSeverity('yes' as any, true);
        assert.strictEqual(severity1, DiagnosticSeverity.Warning);
        assert.strictEqual(severity2, DiagnosticSeverity.Error);
      });
    });
  });
});
