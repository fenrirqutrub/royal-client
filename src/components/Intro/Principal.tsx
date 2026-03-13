import dp from "../../assets/tom.jpg";
import { IoCaretForwardOutline } from "react-icons/io5";

const Principal = () => {
  return (
    <section className="bangla relative pt-12 ">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="text-left mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)]">
          অধ্যক্ষের বাণী
        </h2>
        <p className="text-[var(--color-gray)] text-2xl mt-2">রয়েল একাডেমি</p>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-10 items-center">
        {/* text */}
        <div className="md:w-2/3 space-y-1 text-lg md:text-xl  ">
          <p className="text-justify  leading-relaxed ">
            আসসালামু আলাইকুম। রয়েল একাডেমির পক্ষ থেকে সকল শিক্ষার্থী, অভিভাবক
            এবং শুভানুধ্যায়ীদের জানাই আন্তরিক শুভেচ্ছা ও স্বাগতম। আমাদের
            প্রতিষ্ঠানের মূল লক্ষ্য হলো শিক্ষার্থীদেরকে সুশিক্ষা, নৈতিকতা এবং
            মানবিক মূল্যবোধে গড়ে তোলা।
          </p>

          <p className="text-justify leading-relaxed ">
            বর্তমান যুগ প্রযুক্তি ও জ্ঞানের যুগ। তাই আমরা চেষ্টা করি আধুনিক
            শিক্ষা পদ্ধতির মাধ্যমে শিক্ষার্থীদেরকে যুগোপযোগী শিক্ষা প্রদান করতে।
            দক্ষ শিক্ষক মণ্ডলী, সুন্দর শিক্ষার পরিবেশ এবং বিভিন্ন সহশিক্ষা
            কার্যক্রমের মাধ্যমে আমরা শিক্ষার্থীদের মেধা ও সৃজনশীলতাকে বিকশিত
            করার জন্য নিরলসভাবে কাজ করে যাচ্ছি।
          </p>

          <p className="text-justify  leading-relaxed ">
            আমি বিশ্বাস করি, একজন শিক্ষার্থী যদি সঠিক দিকনির্দেশনা ও অনুপ্রেরণা
            পায়, তবে সে তার জীবনে অনেক দূর এগিয়ে যেতে পারে। তাই আমাদের লক্ষ্য
            শুধু পরীক্ষায় ভালো ফলাফল অর্জন নয়, বরং একজন আদর্শ, সৎ ও দায়িত্বশীল
            নাগরিক তৈরি করা।
          </p>

          <p className="text-justify  leading-relaxed ">
            মহান আল্লাহর রহমতে এবং সকলের সহযোগিতায় আমাদের এই শিক্ষা প্রতিষ্ঠান
            আরও এগিয়ে যাবে—এই প্রত্যাশা ব্যক্ত করছি। সবাইকে ধন্যবাদ।
          </p>

          {/* signature */}
          <p className="font-bold flex items-center gap-2 text-[var(--color-text)]">
            <IoCaretForwardOutline />
            <span>মিঃ টম</span>
          </p>
          <p className="text-gray-600 ml-6">অধ্যক্ষ, রয়েল একাডেমি</p>
        </div>

        {/* image */}
        <figure className="md:w-1/3">
          <img
            src={dp}
            alt="principal"
            className="rounded-xl shadow-lg w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
};

export default Principal;
