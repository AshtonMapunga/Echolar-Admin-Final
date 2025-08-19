import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },

   {
    title: 'Teachers',
    path: '/teachers',
    icon: icon('ic-user'),
  },
   {
    title: 'Classes',
    path: '/classes',
    icon: icon('ic-blog'),
  },
    {
    title: 'Banners',
    path: '/banners',
    icon: icon('ic-blog'),
  },
  {
    title: 'Reals',
    path: '/reels',
    icon: icon('ic-cart'),
   
  },
  {
    title: 'Quiz',
    path: '/quize',
    icon: icon('ic-cart'),
   
  },
    {
    title: 'Exam Papers',
    path: '/exampapers',
    icon: icon('ic-cart'),
   
  },

  
    {
    title: 'Payments',
    path: '/payments',
    icon: icon('ic-cart'),
   
  },

    {
    title: 'Quiz',
    path: '/quize',
    icon: icon('ic-cart'),
   
  },



  {
    title: 'Students',
    path: '/students',
    icon: icon('ic-blog'),
  },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },

];
