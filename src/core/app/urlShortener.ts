import { validateFields } from 'lesgo/utils';

type Input = {
  url: string;
};

const validateInput = (input: Input) => {
  const validFields = [{ key: 'url', type: 'string', required: true }];

  const validated = validateFields(input, validFields);
  return validated as Input;
};

export default (body: Input) => {
  const input = validateInput({ ...body });

  return {
    url: input.url,
  };
};
