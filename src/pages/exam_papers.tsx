import { CONFIG } from 'src/config-global';
import ExamPaperManagement from 'src/sections/examppr/exam_ppr';



// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <ExamPaperManagement />
    </>
  );
}
