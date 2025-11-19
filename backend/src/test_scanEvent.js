import { ScanEventModel } from './models/scanEvent.model.js';
import { AttendanceScanModel } from './models/attendanceScan.model.js';

async function testScanEventModels() {
  try {
    console.log('Testing ScanEventModel.getAllScanEvents...');
    const allScanEvents = await ScanEventModel.getAllScanEvents();
    console.log('getAllScanEvents result:', allScanEvents);

    console.log('Testing ScanEventModel.getScanEventById with dummy ID...');
    const byId = await ScanEventModel.getScanEventById('00000000-0000-0000-0000-000000000000');
    console.log('getScanEventById result:', byId);

    console.log('Testing AttendanceScanModel.getAllScanEvents...');
    const allAttendanceScans = await AttendanceScanModel.getAllScanEvents();
    console.log('AttendanceScanModel.getAllScanEvents result:', allAttendanceScans);

    console.log('Testing AttendanceScanModel.getScanEventById with dummy ID...');
    const byIdAttendance = await AttendanceScanModel.getScanEventById('00000000-0000-0000-0000-000000000000');
    console.log('AttendanceScanModel.getScanEventById result:', byIdAttendance);

    console.log('ScanEvent and AttendanceScan model tests passed.');
  } catch (error) {
    console.error('Error in testing:', error);
  }
}

testScanEventModels();
