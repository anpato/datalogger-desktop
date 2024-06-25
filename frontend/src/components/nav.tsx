import {
  Navbar,
  Dropdown,
  DropdownItem,
  Button,
  DarkThemeToggle
} from 'flowbite-react';
import { ReactNode, forwardRef } from 'react';
import icon from '~/assets/icon.svg';
import { cn } from '../utils/cn';
import { Trash } from 'lucide-react';

type IProps = {
  recentFiles: string[];
  isProcessing: boolean;
  isDisabled: boolean;
  children: ReactNode;
  currentFile: string;
  handleSelectRecent: (file: string) => void;
  handleSubmit: () => void;
  removeFiles: () => void;
};

const Nav = forwardRef<HTMLFormElement | null, IProps>(
  (
    {
      recentFiles,
      handleSelectRecent,
      handleSubmit,
      isDisabled,
      isProcessing,
      currentFile,
      removeFiles,
      children
    },
    formRef
  ) => {
    return (
      <Navbar fluid border>
        <Navbar.Brand className="flex gap-2">
          <img src={icon} className="w-10" alt="logo" />
          <h3 className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Datalogger
          </h3>
        </Navbar.Brand>
        <Navbar.Toggle />

        <Navbar.Collapse>
          <div className="flex flex-col-reverse md:flex-row gap-4 items-center">
            <Dropdown label="Recent files" className="dark:text-white">
              {recentFiles?.map((file) => (
                <Dropdown.Item
                  style={
                    currentFile === file
                      ? {
                          pointerEvents: 'none',
                          cursor: 'default',
                          opacity: 0.5
                        }
                      : {}
                  }
                  className={cn(
                    currentFile === file && ['pointer-events-none']
                  )}
                  onClick={() => handleSelectRecent(file)}
                  key={file}
                >
                  {file}
                </Dropdown.Item>
              ))}
              {recentFiles.length ? (
                <>
                  <Dropdown.Divider />

                  <Dropdown.Item onClick={removeFiles}>
                    <Trash className="mr-2 text-red-500" /> Remove all files
                  </Dropdown.Item>
                </>
              ) : null}
              {!recentFiles.length && (
                <DropdownItem className="cursor-default" disabled>
                  No recent files
                </DropdownItem>
              )}
            </Dropdown>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              ref={formRef}
              className="flex flex-row justify-center items-center gap-2"
            >
              {children}

              <Button
                isProcessing={isProcessing}
                disabled={isDisabled || isProcessing}
                size="xs"
                color="dark"
                type="submit"
                className="p-2 flex justify-between gap-2"
              >
                Upload
              </Button>
            </form>
          </div>
          <DarkThemeToggle />
        </Navbar.Collapse>
      </Navbar>
    );
  }
);

export default Nav;
