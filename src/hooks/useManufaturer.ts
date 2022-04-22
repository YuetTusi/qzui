import { useEffect, useState } from "react";
import Manufaturer from "@src/schema/socket/Manufaturer";
import { helper } from "@src/utils/helper";

export function useManufaturer() {

    const [manu, setManu] = useState<Manufaturer>();

    useEffect(() => {
        (async () => {
            try {
                const data = await helper.readManufaturer();
                setManu(data);
            } catch (error) {
                console.warn(error);
            }
        })();
    }, []);

    return manu;
}