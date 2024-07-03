import { Button, Label, Select, TextInput } from 'flowbite-react';
import { FC, useState } from 'react';

type IProps = {
  availableKeys: string[];
  applyAfr: (key: string, afr: string, afrKey: string) => void;
};

const Calculator: FC<IProps> = ({ availableKeys, applyAfr }) => {
  const [formState, setFormState] = useState({ key: '', afr: '', afrKey: '' });

  return (
    <div className="flex flex-col gap-2">
      <>
        <Label>Key to calculate</Label>
        <Select
          value={formState.key}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, key: e.target.value }))
          }
        >
          {availableKeys.map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </Select>
      </>
      <>
        <Label>AFR datapoint</Label>
        <Select
          value={formState.afrKey}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, afrKey: e.target.value }))
          }
        >
          {availableKeys.map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </Select>
      </>
      <>
        <Label htmlFor="afr">Desired AFR</Label>
        <TextInput
          value={formState.afr}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, afr: e.target.value }))
          }
          name="afr"
        />
      </>
      <Button
        onClick={() => applyAfr(formState.key, formState.afr, formState.afrKey)}
      >
        Calculate
      </Button>
    </div>
  );
};
export default Calculator;
