import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const pkgDir = path.join(root, 'packages', 'swk-signing');

const tempDir = mkdtempSync(path.join(tmpdir(), 'oh-swk-blank-'));
const packageJsonPath = path.join(tempDir, 'package.json');

writeFileSync(
  packageJsonPath,
  JSON.stringify(
    {
      name: 'offer-hub-blank-install-check',
      private: true,
      type: 'module',
      dependencies: {
        '@offer-hub/swk-signing': 'file:' + pkgDir,
        '@stellar/stellar-sdk': '^16.2.0',
      },
    },
    null,
    2
  )
);

mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true });

try {
  execSync('npm install --silent', { cwd: tempDir, stdio: 'inherit' });
  const script = `
    import { createEscrowSigningPayload } from '@offer-hub/swk-signing';
    import { Keypair } from '@stellar/stellar-sdk';
    const payload = createEscrowSigningPayload({
      sourceAccount: Keypair.random().publicKey(),
      contractId: Keypair.random().publicKey(),
      amount: '1.25',
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
    if (!payload || !payload.xdr || payload.xdr.length < 20) {
      throw new Error('missing signed payload');
    }
    console.log('blank-project-install-ok');
  `;

  writeFileSync(path.join(tempDir, 'verify.mjs'), script);
  execSync('node verify.mjs', { cwd: tempDir, stdio: 'inherit' });
  console.log('Blank-project install check passed.');
} catch (error) {
  console.error('Blank-project install check failed.');
  throw error;
}
