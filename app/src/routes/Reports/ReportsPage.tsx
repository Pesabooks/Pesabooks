import { Heading } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export const ReportsPage = () => {
  return (
    <>
      <Heading as="h2" size="lg" mb={30}>
        Reports
      </Heading>

      {<Outlet />}
    </>
  );
};
