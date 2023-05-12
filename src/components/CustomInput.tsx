import { Typography } from "@material-tailwind/react";
import { type FC, type InputHTMLAttributes, useState } from "react";
import { ZodError, type ZodSchema } from "zod";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isError?: boolean;
  validationSchema?: ZodSchema;
  onValidation?: (error: boolean) => void;
  validationFunction?: (value: string) => string | boolean;
}

const CustomInput: FC<Props> = ({
  label,
  isError,
  validationSchema,
  onValidation,
  validationFunction,
  ...props
}) => {
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      validationSchema?.parse(e.target.value);
      const validation = validationFunction?.(e.target.value);
      if (typeof validation === "string" || validation === false) {
        setError(validation || "Error!");
        onValidation?.(true);
      } else {
        setError(null);
        onValidation?.(false);
      }
    } catch (e) {
      if (e instanceof ZodError) {
        setError(e.flatten().formErrors[0] || "Error!");
        onValidation?.(true);
      }
    }
    props.onChange?.(e);
  };

  return (
    <div className="max-w-xl">
      <div className="relative h-11 w-full min-w-[200px]">
        <input
          className={`${
            isError || error
              ? "border-pink-500 text-red-700 placeholder-shown:border-red-500 placeholder-shown:border-t-pink-500 focus:border-pink-500"
              : "border-blue-gray-200 text-blue-gray-700 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-blue-500"
          } peer h-full w-full rounded-md border border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50`}
          {...props}
          placeholder=" "
          onChange={onChange}
        />
        <label
          className={`${
            isError || error
              ? "text-red-400 before:border-red-200 after:border-red-200 peer-placeholder-shown:text-pink-500 peer-focus:text-pink-500  peer-focus:before:border-pink-500 peer-focus:after:border-pink-500"
              : "text-blue-gray-400 before:border-blue-gray-200 after:border-blue-gray-200 peer-placeholder-shown:text-blue-gray-500 peer-focus:text-blue-500 peer-focus:before:border-blue-500 peer-focus:after:border-blue-500"
          } before:content[' '] after:content[' '] pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none text-[11px] font-normal leading-tight transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:transition-all after:pointer-events-none after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500`}
        >
          {label}
        </label>
      </div>
      {error && (
        <Typography
          variant="small"
          color="red"
          className={`font-normal} mt-1 flex items-center gap-1`}
        >
          <InformationCircleIcon className="-mt-px h-4 w-4" />
          {error}
        </Typography>
      )}
    </div>
  );
};
export default CustomInput;
