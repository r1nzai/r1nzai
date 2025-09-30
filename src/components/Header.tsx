import { cx } from "@rinzai/zen";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header
            className={cx("flex items-center justify-between", "px-3 py-1")}
        >
            <h1 className={cx("text-3xl font-bold", "text-primary")}>Rinzai</h1>
            <nav>
                <ThemeToggle />
            </nav>
        </header>
    );
}
