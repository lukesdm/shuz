import { NextPage } from "next";

function newTest<T>(name: string, expected: T, actual: T) {
    return { name, expected, actual, pass: actual === expected };
}

const HomeTest: NextPage = () => {
    const tests = [
        newTest('Test 1', 1, 1),
    ];
    return <div>
        { tests.map((t, i) => <p key={i}>{t.name}: expected: {t.expected}, actual: {t.actual}, pass: {t.pass.toString()}</p> ) }
    </div>
}

export default HomeTest