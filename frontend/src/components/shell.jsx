import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Terminal } from "@xterm/xterm";
import { AttachAddon } from "@xterm/addon-attach";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";

let lineBuffer = [];
let history = [];
let shellListener = null;
let offset = 0;

export const Shell = () => {
  const navigate = useNavigate();
  const handleClick = () => navigate("/");
  const terminal = useRef(null);
  const { playgroundId } = useParams();

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#1e1e1e",
        foreground: "#f8f8f2",
        cyan: "#8be9fd",
        green: "#50fa7b",
        yellow: "#f1fa8c",
        red: "#ff5555",
        cursor: "#f8f8f2",
        cursorAccent: "#282a36",
      },
      fontSize: 16,
      fontFamily: "Ubuntu Mono, monospace",
    });

    async function simpleShell(data) {
      // string splitting is needed to also handle multichar input (eg. from copy)
      for (let i = 0; i < data.length; ++i) {
        const c = data[i];
        if (c === "\r") {
          // <Enter> was pressed case
          offset = 0;
          term.write("\r\n");
          if (lineBuffer.length) {
            // we have something in line buffer, normally a shell does its REPL logic here
            // for simplicity - just join characters and exec...
            const command = lineBuffer.join("");
            lineBuffer.length = 0;
            history.push(command);
            try {
              // tricky part: for interactive sub commands you have to detach the shell listener
              // temporarily, and re-attach after the command was finished
              shellListener?.dispose();
              //await exec(command);  // issue: cannot force-kill in JS (needs to be a good citizen)
            } catch (e) {
              // we have no real process separation with STDERR
              // simply catch any error and output in red
              const msg = !e ? "Unknown Error..." : e.message || e;
              term.write(`\x1b[31m${msg.replace("\n", "\r\n")}\x1b[m`);
            } finally {
              // in any case re-attach shell
              shellListener = term.onData(simpleShell);
            }
          }
          term.write("> ");
        } else if (c === "\x7F") {
          // <Backspace> was pressed case
          if (lineBuffer.length) {
            if (offset === 0) {
              lineBuffer.pop();
              term.write("\b \b");
            } else if (offset < 0 && Math.abs(offset) !== lineBuffer.length) {
              var insert = "";

              for (
                var ci = lineBuffer.length + offset;
                ci < lineBuffer.length;
                ci++
              ) {
                insert += lineBuffer[ci];
              }

              lineBuffer.splice(lineBuffer.length + offset - 1, 1);

              var lefts = "";

              for (var ci = 0; ci < insert.length; ci++) {
                lefts += "\x1b[1D";
              }

              var termInsert = "\b \b" + insert + " " + "\b \b" + lefts;
              term.write(termInsert);
            }
          }
        } else if (
          ["\x1b[A", "\x1b[B", "\x1b[C", "\x1b[D"].includes(
            data.slice(i, i + 3)
          )
        ) {
          // <arrow> keys pressed
          if (data.slice(i, i + 3) === "\x1b[A") {
            // UP pressed, select backwards from history + erase terminal line + write history entry
          } else if (data.slice(i, i + 3) === "\x1b[B") {
            // DOWN pressed, select forward from history + erase terminal line + write history entry
          } else if (data.slice(i, i + 3) === "\x1b[C") {
            if (offset < 0) {
              term.write("\x1b[1C");
              offset++;
            }
          } else if (data.slice(i, i + 3) === "\x1b[D") {
            if (Math.abs(offset) < lineBuffer.length) {
              term.write("\x1b[1D");
              offset--;
            }
          }

          i += 2;
        } else {
          // push everything else into the line buffer and echo back to user

          var insert = "";
          insert += c;

          for (
            var ci = lineBuffer.length + offset;
            ci < lineBuffer.length;
            ci++
          ) {
            insert += lineBuffer[ci];
          }

          var shift = "";

          if (offset < 0) {
            for (
              var ci = lineBuffer.length + offset;
              ci < lineBuffer.length;
              ci++
            ) {
              shift += "\x1b[1D";
            }
          }

          if (offset === 0) {
            lineBuffer.push(c);
          } else if (offset < 0) {
            lineBuffer.splice(lineBuffer.length + offset, 0, c);
          }

          var termInsert = insert;

          if (offset < 0) {
            termInsert += shift;
          }

          term.write(termInsert);
        }
      }
    }
    term.open(terminal.current);

    let fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();
    shellListener = term.onData(simpleShell);
    term.write("SimpleShell> ");

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <Box
      position="fixed"
      left={0}
      bottom={0}
      width="100%"
      height="50vh"
      bg="#282a36"
    >
      <Flex justify="left" align="" gap={5}>
        <Text mb={2} fontSize="lg" p={2}>
          Bash Shell
        </Text>
        <Button onClick={handleClick} mt={1}>
          Editor
        </Button>
      </Flex>
      <Box
        position="fixed"
        left={0}
        width="100%"
        height="50vh"
        // bg="gray.200"
        ref={terminal}
        className="terminal"
        id="terminal-container"
      ></Box>
    </Box>
  );
};
