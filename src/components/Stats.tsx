import { stats } from "@/data/stats"

const Stats: React.FC = () => {
    return (
        <section id="stats" className="border-y border-line bg-surface">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-3 sm:gap-8">
                {stats.map(stat => (
                    <div key={stat.title} className="group mx-auto max-w-md text-center sm:mx-0 sm:max-w-full sm:text-left">
                        <h3 className="flex items-center justify-center gap-3 sm:justify-start">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-shadow duration-300 group-hover:shadow-glow">
                                {stat.icon}
                            </span>
                            <span className="font-mono text-4xl font-medium tracking-tight text-gradient">
                                {stat.title}
                            </span>
                            <span className="font-mono text-xs uppercase tracking-widest text-muted">
                                {stat.label}
                            </span>
                        </h3>
                        <p className="mt-4 text-base text-muted">{stat.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Stats
