import Header from "@rinzai/components/Header";
import { cx } from "@rinzai/utils/cx";
import Image from "next/image";
import Typer from "@rinzai/components/Typer";

export default function Home() {
    return (
        <main className={cx("bg-background", "min-h-screen flex flex-col")}>
            <Header />
            <section
                className={cx("flex items-center justify-center grow gap-5")}
            >
                <div>
                    <h1 className={cx("text-3xl font-bold", "text-primary")}>
                        {"Hi I'm Rinzai"}
                    </h1>
                    <Typer
                        text={"I'm a software engineer"}
                        className={"text-primary"}
                    />
                </div>
                <Image
                    src={"/fern.png"}
                    alt={"fern"}
                    width={160}
                    height={90}
                    className={"rounded-full object-cover w-40 aspect-square"}
                />
            </section>
        </main>
    );
}
