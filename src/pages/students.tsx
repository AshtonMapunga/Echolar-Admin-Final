import { CONFIG } from 'src/config-global';

import StudentManagementScreen from 'src/sections/students/student-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Students - ${CONFIG.appName}`}</title>

      <StudentManagementScreen />
    </>
  );
}
