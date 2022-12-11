import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_NORMAL, PASTE_COMMAND } from 'lexical';
import { useEffect } from 'react';

type ImagesPluginProps = {
  onPaste: (files: FileList) => void;
};

export default function ImagesPlugin(props: ImagesPluginProps): JSX.Element | null {
  const { onPaste } = props;

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<InputEvent>(
        PASTE_COMMAND,
        (event: InputEvent) => {
          /*
           * This registers a paste event listener on the editor.
           * The InputEvent/ClipboardEvent will be triggered both when the user pastes something into the editor.
           */
          const { dataTransfer } = event;
          if (dataTransfer && dataTransfer.files.length) {
            const { files } = dataTransfer;
            onPaste && onPaste(files);
          }
          return true;
        },
        COMMAND_PRIORITY_NORMAL
      )
    );
  }, [editor, onPaste]);

  return null;
}
