import { cx } from "@rinzai/utils/cx";

interface ToggleProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    onChange: (e: boolean) => void;
}

export default function Toggle(props: ToggleProps) {
    const { className, checked, onChange, ...rest } = props;
    return (
        <div
            className={cx(
                "rounded-full w-10 h-5 bg-slate-400 flex items-center",
            )}
            onClick={() => {
                onChange(!checked);
            }}
        >
            <input
                type="checkbox"
                className={cx("hidden")}
                checked={checked}
                onChange={() => {}}
                {...rest}
            />
            <div
                className={cx(
                    "rounded-full w-4 h-4 bg-lime-500",
                    checked ? "translate-x-5" : "translate-x-0",
                )}
            />
        </div>
    );
}
