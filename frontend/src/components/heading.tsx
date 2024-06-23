import { FC } from 'react';
import { cn } from '~/utils/cn';

const Heading: FC<{ currFile?: string }> = ({ currFile }) => {
  return (
    <div className="flex flex-col items-center">
      <code
        className={cn(
          currFile ? 'visible' : 'invisible',
          'whitespace-nowrap text-wrap text-xl font-semibold dark:text-white mb-2'
        )}
      >
        {currFile}
      </code>

      <h3
        className={cn([
          'prose whitespace-nowraptext-md font-light dark:text-white mb-2'
        ])}
      >
        Select data points from the menu.
      </h3>
    </div>
  );
};

export default Heading;
