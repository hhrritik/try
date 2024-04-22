import { useRef, useState } from "react";
import { Box, Button, HStack, Flex } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { Shell } from "./shell";
import { useNavigate } from "react-router-dom";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };
  const navigate = useNavigate();
  const handleClick = () => navigate("/bash");
  return (
    <Box
      position="fixed"
      left={0}
      bottom={0}
      width="100%"
      height="50vh"
      bg="#282a36"
      p={2}
    >
      <HStack spacing={4}>
        <Box w="50%">
          <Flex justify="left" align="" gap={5}>
            <LanguageSelector
              language={language}
              onSelect={onSelect}
              left={0}
            />
            <Button onClick={handleClick}>Bash</Button>
          </Flex>

          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="52vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};
export default CodeEditor;
