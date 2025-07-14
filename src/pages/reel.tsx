import { CONFIG } from 'src/config-global';

import ReelsManagement from 'src/sections/reel/reel-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>

      <ReelsManagement />
    </>
  );
}
