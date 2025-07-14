import { CONFIG } from 'src/config-global';

import TeacherManagement from 'src/sections/teacher/teacher-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Students - ${CONFIG.appName}`}</title>

      <TeacherManagement />
    </>
  );
}
