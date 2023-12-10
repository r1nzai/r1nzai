import { cx } from "@rinzai/utils/cx";
import ThemeToggle from "@rinzai/components/theme/ThemeToggle";

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
