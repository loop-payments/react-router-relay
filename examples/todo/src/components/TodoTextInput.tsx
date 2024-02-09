import * as React from "react";
import { useEffect, useRef, useState } from "react";
type Props = {
  readonly className: string;
  readonly commitOnBlur?: boolean;
  readonly initialValue?: string;
  readonly onCancel?: () => void;
  readonly onDelete?: () => void;
  readonly onSave: (arg0: string) => void;
  readonly placeholder?: string;
};
const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

const TodoTextInput = ({
  className,
  commitOnBlur,
  initialValue,
  onCancel,
  onDelete,
  onSave,
  placeholder
}: Props): React.ReactElement<React.ComponentProps<"input">, "input"> => {
  const [text, setText] = useState<string>(initialValue || '');
  const inputRef = useRef();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const commitChanges = () => {
    const newText = text.trim();

    if (onDelete && newText === '') {
      onDelete();
    } else if (onCancel && newText === initialValue) {
      onCancel();
    } else if (newText !== '') {
      onSave(newText);
      setText('');
    }
  };

  const handleBlur = () => {
    if (commitOnBlur) {
      commitChanges();
    }
  };

  const handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => setText(e.currentTarget.value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onCancel && e.keyCode === ESC_KEY_CODE) {
      onCancel();
    } else if (e.keyCode === ENTER_KEY_CODE) {
      commitChanges();
    }
  };

  return <input className={className} onBlur={handleBlur} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={placeholder} ref={inputRef} value={text} />;
};

export default TodoTextInput;