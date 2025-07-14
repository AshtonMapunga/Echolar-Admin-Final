import { _posts } from 'src/_mock';
import { CONFIG } from 'src/config-global';
import BannersManagement from 'src/sections/banners/banner-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <BannersManagement />
    </>
  );
}
