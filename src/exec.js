import { execFile } from 'child_process';

export default (binary, args = [], cwd = './') => (new Promise((resolve) => {
    console.log(`${binary} ${args.map((a) => (`"${a}"`)).join(' ')}`);
    const exec = execFile(binary, [...args], { cwd });
    let stdout = '';
    let stderr = '';
    const end = () => {
        resolve({
            binary,
            args,
            cwd,
            stdout,
            stderr,
        });
    };
    exec.stdout.on('data', (data) => { stdout += data; });
    exec.stderr.on('data', (data) => { stderr += data; });
    exec.on('close', end);
    exec.on('exit', end);
}));
