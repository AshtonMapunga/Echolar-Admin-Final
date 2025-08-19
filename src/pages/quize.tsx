import { CONFIG } from 'src/config-global';
import QuizManagement from 'src/sections/quize/quize';



// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <QuizManagement/>
    </>
  );
}
