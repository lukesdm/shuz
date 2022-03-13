import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ReceiverSecurityContext, SenderSecurityContext } from "../lib/receiver";

function newTest<T>(name: string, expected: T, actual: T) {
    return { name, expected, actual, pass: actual === expected };
}

const roundTripEncryptionTest = async () => {
    const messagePlain = 'Hello there! 👍';
    const rsc = new ReceiverSecurityContext();
    await rsc.init();

    const publicKey = rsc.receiverId;

    const ssc = new SenderSecurityContext();

    const messageEncrypted = await ssc.encrypt(publicKey, messagePlain);
    console.log(messageEncrypted);

    const messageDecrypted = await rsc.decrypt(messageEncrypted);
    
    return newTest('Round-trip encryption test', messagePlain, messageDecrypted);
}

type Test = ReturnType<typeof newTest>;

const HomeTest: NextPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [err, setErr] = useState<Error>();

    useEffect(() => {
        (async () => {
            try {
                setTests([
                    newTest('Test test', 1, 1),
                    await roundTripEncryptionTest(),
                ]);
            } catch (newErr) {
                console.error(newErr);
                setErr(newErr as Error);
            }
        })();
    }, []);
    return <div>
        { tests.map((t, i) => <p key={i}>{t.name}: expected: {t.expected}, actual: {t.actual}, pass: {t.pass.toString()}</p> ) }
        { err ? <p>{err.toString()}</p> : null }
    </div>
}

export default HomeTest