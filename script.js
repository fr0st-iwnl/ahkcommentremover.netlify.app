 const modeToggle = document.getElementById('modeToggle');
        const processButtonText = document.getElementById('processButtonText');
        const inputCode = document.getElementById('inputCode');
        const outputCode = document.getElementById('outputCode');

        // Set initial state
        updateUIState(modeToggle.checked);

        modeToggle.addEventListener('change', function() {
            updateUIState(this.checked);
        });

        function updateUIState(isRemoveMode) {
            processButtonText.textContent = isRemoveMode ? 'Add Comments' : 'Remove Comments';
            inputCode.placeholder = isRemoveMode ? 
                'Paste your code without comments here...' : 
                'Paste your AutoHotkey code here...';
            outputCode.placeholder = isRemoveMode ? 
                'Your code with comments will appear here...' : 
                'Your code without comments will appear here...';
        }

        function processCode() {
            const isRemoveMode = modeToggle.checked;
            const input = inputCode.value;
            
            if (isRemoveMode) {
                addComments(input);
            } else {
                removeComments(input);
            }
        }

        function removeComments(input) {
            const lines = input.split('\n');
            const resultLines = [];
            let inBlockComment = false;

            for (const rawLine of lines) {
                const line = rawLine.replace(/\r$/, '');
                let lineResult = '';
                let inString = false;
                let stringChar = '';
                let i = 0;

                while (i < line.length) {
                    const char = line[i];
                    const prevChar = i > 0 ? line[i - 1] : '';
                    const nextChar = i + 1 < line.length ? line[i + 1] : '';

                    if (inBlockComment) {
                        if (char === '*' && nextChar === '/') {
                            inBlockComment = false;
                            i += 2;
                        } else {
                            i += 1;
                        }
                        continue;
                    }

                    if (inString) {
                        lineResult += char;
                        if (char === stringChar && prevChar !== '`') {
                            inString = false;
                        }
                        i += 1;
                        continue;
                    }

                    if ((char === '"' || char === "'") && prevChar !== '`') {
                        inString = true;
                        stringChar = char;
                        lineResult += char;
                        i += 1;
                        continue;
                    }

                    if (char === '/' && nextChar === '*') {
                        inBlockComment = true;
                        lineResult = lineResult.replace(/[ \t]+$/, '');
                        i += 2;
                        continue;
                    }

                    if (char === ';') {
                        lineResult = lineResult.replace(/[ \t]+$/, '');
                        break;
                    }

                    lineResult += char;
                    i += 1;
                }

                const trimmedResult = lineResult.replace(/[ \t]+$/, '');

                if (trimmedResult.trim() !== '') {
                    resultLines.push(trimmedResult);
                    continue;
                }

                if (!inBlockComment && line.trim() === '') {
                    resultLines.push('');
                }
            }

            outputCode.value = resultLines.join('\n');
        }

        function addComments(input) {
            // Process line by line
            let result = input.split('\n').map(line => {
                // Skip empty lines
                if (line.trim() === '') {
                    return line;
                }

                // Skip lines that are already comments
                if (line.trimStart().startsWith(';')) {
                    return line;
                }

                // Add semicolon at the start of the line
                return `; ${line}`;
            }).join('\n');

            outputCode.value = result;
        }

        // Add copy to clipboard functionality
        function copyToClipboard(elementId) {
            const textarea = document.getElementById(elementId);
            textarea.select();
            document.execCommand('copy');
            
            // Visual feedback
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 1500);
        }