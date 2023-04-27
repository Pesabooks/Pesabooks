import { Img, useColorMode } from '@chakra-ui/react';
import React from 'react';

export const Logo = ({ theme }: { theme?: 'light' | 'dark' }) => {
  const { colorMode } = useColorMode();
  let logo;

  if (theme) {
    logo = theme === 'light' ? 'logo-monochrone-white-beta.png' : 'logo-monochrone-black-beta.png';
  } else {
    logo = colorMode === 'light' ? 'logo-dark-beta.png' : 'logo-light-beta.png';
  }
  return <Img w="200px" src={`${process.env.PUBLIC_URL}/images/${logo}`}></Img>;
};
