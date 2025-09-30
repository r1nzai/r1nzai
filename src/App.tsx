import { cx } from '@rinzai/zen'
import Header from './components/Header'
import Typer from './components/Typer'
import fern from "./assets/fern.png"
function App() {

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
                <img
                    src={fern}
                    alt={"fern"}
                    width={160}
                    height={90}
                    className={"rounded-full object-cover w-40 aspect-square"}
                />
            </section>
        </main>
  )
}

export default App
