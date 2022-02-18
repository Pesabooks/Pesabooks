import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { BottomSheet } from './BottomSheet';
import { Footer } from './Footer';
import { MainPanel } from './MainPanel';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Sidebar onClose={onClose} display={{ sm: 'none', xl: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MainPanel
        w={{
          base: '100%',
          xl: 'calc(100% - 275px)',
        }}
      >
        <Navbar onOpen={onOpen} />
        <Box ms="auto" me="auto" ps="15px" pe="15px">
          <Box p="30px 15px" minHeight="calc(100vh - 123px)">
            {<Outlet />}
          </Box>
        </Box>
        <Footer />
        <BottomSheet />
      </MainPanel>
    </>
  );
};
