export default function Cards({colorBg}) {
  return (
    <section className="px-4 pb-10 flex flex-col items-center justify-evenly gap-10">

      {/* Section Title */}
      <h2
        className="
          lg:text-5xl 
          text-3xl
          font-bold 
          text-center
          tracking-wide 
          text-[#e5f4ff]
          drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
        "
      >
        Helpful Reads for Dallas
      </h2>

      {/* Responsive Square Grid */}
      <div
        className="
          grid 
          grid-cols-2
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          gap-4
        "
      >
        {[
          { title: "How to Drive Safely on Black Ice" },
          { title: "Protecting Your Car from Hail" },
          { title: "Insulation Lowering Heating Costs this Week" },
          { title: "Best Cocoa Winter Drinks in Dallas" },
        ].map((item, index) => (
          <div
            key={index}
            className={`
              bg-[${colorBg}]/90
              border border-[#70c6dd]/30
              rounded-2xl
              p-3
              flex flex-col
              shadow-[0_10px_25px_rgba(0,0,0,0.45)]
              transition-all duration-300
              hover:border-[rgb(112,198,221)]
              lg:h-[450px]
              h-[250px]
            `}
          >
            {/* Image Wrapper = 60% of card height */}
            <div
              className="
                w-full 
                h-[60%]            /* ← exactly 60% card height */
                rounded-xl
                border border-[#70c6dd]/40
                bg-gradient-to-b from-[#879fb8]/40 to-[#1e211a]/40
                flex items-center justify-center
              "
            >
              <div className="w-12 h-12 border border-[#70c6dd]/40 rounded-md opacity-60" />
            </div>

            {/* Title */}
            <p className="lg:text-[25px] text-[15px] font-semibold text-[#e5f4ff] mt-3 leading-snug line-clamp-2">
              {item.title}
            </p>

            {/* Lines */}
            <div className="space-y-1 mt-auto">
              <div className="h-[10px] w-full rounded bg-[#70c6dd]/40" />
              <div className="h-[10px] w-4/5 rounded bg-[#70c6dd]/30" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
