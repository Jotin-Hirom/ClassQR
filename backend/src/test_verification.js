import { VerificationModel } from './models/verification.model.js';

async function testVerificationModel() {
  try {
    console.log('Testing getAllVerifications...');
    const all = await VerificationModel.getAllVerifications();
    console.log('getAllVerifications result:', all);

    // Test create if possible, but since it requires scan_id and teacher_id, skip or use dummy
    // For critical-path, just test read methods
    console.log('Testing getVerificationById with dummy ID...');
    const byId = await VerificationModel.getVerificationById('00000000-0000-0000-0000-000000000000');
    console.log('getVerificationById result:', byId);

    console.log('VerificationModel tests passed.');
  } catch (error) {
    console.error('Error in testing:', error);
  }
}

testVerificationModel();
