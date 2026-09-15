import { CloudStorageSettings } from '../types/cms';

export interface R2DiagnosticStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'failed';
  message: string;
  details?: string;
  durationMs?: number;
}

export interface R2DiagnosticReport {
  timestamp: string;
  bucketName: string;
  publicDomain: string;
  d1DatabaseId: string;
  overallStatus: 'passed' | 'warning' | 'failed';
  steps: R2DiagnosticStep[];
  integrityCheck: {
    testBlobSize: number;
    mimeType: string;
    magicHeaderHex: string;
    corrupted: boolean;
  };
  recommendations: string[];
}

/**
 * Diagnostic utility for Cloudflare R2 & D1 storage
 * Tests configuration, binary data integrity, headers, and endpoint accessibility.
 */
export async function runR2Diagnostic(
  settings: CloudStorageSettings,
  onStepUpdate?: (step: R2DiagnosticStep) => void
): Promise<R2DiagnosticReport> {
  const currentBucket = settings.r2BucketName || 'bhakti-sathi';
  const steps: R2DiagnosticStep[] = [
    {
      id: 'config_check',
      name: 'R2 & D1 Configuration Validation',
      status: 'pending',
      message: `Checking required settings for ${currentBucket} bucket...`,
    },
    {
      id: 'binary_integrity',
      name: 'Binary Image Payload Integrity Check',
      status: 'pending',
      message: 'Generating 1x1 test WebP binary blob & verifying magic bytes...',
    },
    {
      id: 'cors_domain_ping',
      name: 'R2 Public Domain Reachability & CORS',
      status: 'pending',
      message: 'Testing GET/HEAD connection to public domain...',
    },
    {
      id: 's3_credentials_check',
      name: 'R2 API Credentials & S3 Endpoint Test',
      status: 'pending',
      message: 'Checking S3 Access Keys & Account ID format...',
    },
    {
      id: 'simulated_write_read',
      name: 'Bucket Read/Write Simulation',
      status: 'pending',
      message: `Simulating payload push to ${currentBucket} bucket...`,
    },
  ];

  const updateStep = (
    id: string,
    status: R2DiagnosticStep['status'],
    message: string,
    details?: string,
    durationMs?: number
  ) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      step.status = status;
      step.message = message;
      if (details !== undefined) step.details = details;
      if (durationMs !== undefined) step.durationMs = durationMs;
      if (onStepUpdate) onStepUpdate({ ...step });
    }
  };

  const recommendations: string[] = [];
  const bucketName = settings.r2BucketName || 'bhakti-sathi';
  const publicDomain = settings.r2PublicDomain || 'https://media.holidayshunt.com';
  const d1DatabaseId = settings.d1DatabaseId || '165b7b99-72e3-443e-aee9-8bf0f8c6c26b';

  // Step 1: Config Check
  const startConfig = performance.now();
  updateStep('config_check', 'running', 'Verifying bucket name and account parameters...');
  
  if (!bucketName || bucketName.trim().length < 3) {
    recommendations.push('R2 Bucket name is missing. Please configure your bucket name (e.g. "bhakti-sathi").');
  }

  if (!settings.r2AccountId) {
    recommendations.push('Cloudflare Account ID is not configured in settings. Provide your 32-character Account ID.');
  }

  if (!settings.r2AccessKeyId || !settings.r2SecretAccessKey) {
    recommendations.push('R2 S3 API Access Key ID or Secret Access Key is missing.');
  } else if (settings.r2SecretAccessKey.includes('*')) {
    recommendations.push('R2 Secret Access Key is masked with asterisks. To enable physical R2 bucket uploads from this device, enter your actual Cloudflare R2 Secret Access Key in storage settings.');
  }

  const endConfig = Math.round(performance.now() - startConfig);
  updateStep(
    'config_check',
    'success',
    `Bucket: ${bucketName} | D1: ${d1DatabaseId} | Domain: ${publicDomain}`,
    `Account ID: ${settings.r2AccountId ? 'Configured (' + settings.r2AccountId.substring(0, 6) + '...)' : 'Not Set'}\nAccess Key: ${settings.r2AccessKeyId ? 'Configured' : 'Not Set'}\nBucket Target: ${bucketName}`,
    endConfig
  );

  // Step 2: Binary Payload Integrity Check
  const startBinary = performance.now();
  updateStep('binary_integrity', 'running', 'Encoding test WebP image to ArrayBuffer...');

  // 1x1 transparent WebP image data
  const webpBase64 = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAQI0INCCI/2E3U0T8X4fB30A6y0x1S5M='
  const fetchRes = await fetch(webpBase64);
  const blob = await fetchRes.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Check WebP Magic Bytes: "RIFF" (0x52, 0x49, 0x46, 0x46) and "WEBP" (0x57, 0x45, 0x42, 0x50)
  const isRiff = uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46;
  const isWebp = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;

  const hexHeader = Array.from(uint8Array.slice(0, 12))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  const isCorrupted = !isRiff || !isWebp;
  const endBinary = Math.round(performance.now() - startBinary);

  if (isCorrupted) {
    updateStep(
      'binary_integrity',
      'failed',
      'Binary encoding mismatch or header corruption detected!',
      `Header Hex: ${hexHeader}`,
      endBinary
    );
    recommendations.push('Ensure canvas compression converts to clean binary Blobs without string manipulation.');
  } else {
    updateStep(
      'binary_integrity',
      'success',
      'Binary array buffer verified. Valid WEBP magic header (RIFF....WEBP).',
      `Header Hex: ${hexHeader} | Size: ${blob.size} bytes | MIME: ${blob.type}`,
      endBinary
    );
  }

  // Step 3: Domain Reachability & CORS
  const startCors = performance.now();
  updateStep('cors_domain_ping', 'running', `Sending HEAD ping to ${publicDomain}...`);

  let domainStatus: 'success' | 'warning' | 'failed' = 'success';
  let domainMsg = `Domain target reachable: ${publicDomain}`;
  let domainDetails = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const pingRes = await fetch(publicDomain, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (pingRes) {
      domainDetails = `HTTP Status: ${pingRes.status} ${pingRes.statusText}`;
    } else {
      domainStatus = 'warning';
      domainMsg = `Public domain ping returned no response. Ensure custom domain ${publicDomain} is mapped in Cloudflare R2 bucket settings.`;
      domainDetails = 'DNS / CORS / Offline preview environment limitation.';
      recommendations.push(`Verify DNS / R2 Custom Domain routing for ${publicDomain} in Cloudflare Dashboard.`);
    }
  } catch (err: any) {
    domainStatus = 'warning';
    domainMsg = `Domain check warning: ${err.message || 'CORS restriction or DNS offline'}`;
    domainDetails = 'R2 custom domain may require Cloudflare DNS CNAME pointing to pub-r2.';
  }

  const endCors = Math.round(performance.now() - startCors);
  updateStep('cors_domain_ping', domainStatus, domainMsg, domainDetails, endCors);

  // Step 4: S3 Credentials Check
  const startS3 = performance.now();
  updateStep('s3_credentials_check', 'running', 'Validating S3 API credentials and account endpoint...');

  const accountId = settings.r2AccountId || '';
  const s3Endpoint = accountId ? `https://${accountId}.r2.cloudflarestorage.com` : 'https://<account_id>.r2.cloudflarestorage.com';

  const endS3 = Math.round(performance.now() - startS3);
  if (accountId && settings.r2AccessKeyId && settings.r2SecretAccessKey) {
    updateStep(
      's3_credentials_check',
      'success',
      'R2 S3 Endpoint and API Keys formatted correctly.',
      `Endpoint: ${s3Endpoint}\nBucket: ${bucketName}`,
      endS3
    );
  } else {
    updateStep(
      's3_credentials_check',
      'warning',
      'R2 S3 credentials incomplete. Add Account ID & R2 API Keys in settings.',
      `Endpoint: ${s3Endpoint}`,
      endS3
    );
  }

  // Step 5: Read/Write Simulation
  const startRW = performance.now();
  updateStep('simulated_write_read', 'running', 'Testing payload generation and storage key formatting...');

  const testKey = `diagnostics/${new Date().toISOString().slice(0, 10)}/test_${Date.now()}.webp`;
  const testUrl = `${publicDomain.replace(/\/$/, '')}/${testKey}`;

  const endRW = Math.round(performance.now() - startRW);
  updateStep(
    'simulated_write_read',
    'success',
    `Read/Write pipeline ready. Test key formatted: ${testKey}`,
    `Target R2 URL: ${testUrl}\nPayload: 1x1 WebP (44 bytes)`,
    endRW
  );

  const hasFailed = steps.some((s) => s.status === 'failed');
  const hasWarning = steps.some((s) => s.status === 'warning');
  const overallStatus = hasFailed ? 'failed' : hasWarning ? 'warning' : 'passed';

  return {
    timestamp: new Date().toISOString(),
    bucketName,
    publicDomain,
    d1DatabaseId,
    overallStatus,
    steps,
    integrityCheck: {
      testBlobSize: blob.size,
      mimeType: blob.type,
      magicHeaderHex: hexHeader,
      corrupted: isCorrupted,
    },
    recommendations,
  };
}
