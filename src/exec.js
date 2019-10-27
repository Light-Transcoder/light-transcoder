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
    exec.stdout.on('data', (data) => { console.log(data.toString()) });
    exec.stderr.on('data', (data) => { console.log(data.toString()) });
    exec.on('close', end);
    exec.on('exit', end);
}));
