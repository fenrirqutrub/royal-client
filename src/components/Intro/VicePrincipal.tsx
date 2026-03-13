import dp from "../../assets/tom.jpg";
import { IoCaretForwardOutline } from "react-icons/io5";

const VicePrincipal = () => {
  return (
    <section className="bangla py-12 px-6 md:px-16">
      <div className="text-center md:text-right mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)]">
          উপাধ্যক্ষের বাণী
        </h2>
        <p className="text-[var(--color-gray)] text-2xl mt-2">রয়েল একাডেমি</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-center">
        {/* image */}
        <figure className="md:w-1/3">
          <img
            src={dp}
            alt="vice principal"
            className="rounded-xl shadow-lg w-full object-cover"
          />
        </figure>

        {/* text */}
        <div className="md:w-2/3 text-[var(--color-gray)]  text-lg md:text-xl ">
          <p className="text-justify   leading-relaxed mb-4">
            আসসালামু আলাইকুম। রয়েল একাডেমির সকল শিক্ষার্থী, অভিভাবক এবং
            শুভানুধ্যায়ীদের জানাই আন্তরিক শুভেচ্ছা ও স্বাগতম। আমাদের
            প্রতিষ্ঠানের লক্ষ্য হলো এমন একটি শিক্ষার পরিবেশ তৈরি করা যেখানে
            শিক্ষার্থীরা জ্ঞান, নৈতিকতা এবং মানবিক মূল্যবোধে সমৃদ্ধ হয়ে উঠতে
            পারে।
          </p>

          <p className="text-justify   leading-relaxed mb-4">
            আমরা বিশ্বাস করি যে প্রতিটি শিক্ষার্থীর মধ্যেই অসীম সম্ভাবনা লুকিয়ে
            আছে। সেই সম্ভাবনাকে বিকশিত করার জন্য প্রয়োজন সঠিক দিকনির্দেশনা,
            পরিশ্রম এবং একটি সহায়ক শিক্ষার পরিবেশ। আমাদের শিক্ষক মণ্ডলী
            আন্তরিকতা ও নিষ্ঠার সাথে শিক্ষার্থীদেরকে সেই সুযোগ প্রদান করে থাকেন।
          </p>

          <p className="text-justify   leading-relaxed mb-4">
            আধুনিক শিক্ষার সাথে তাল মিলিয়ে আমরা প্রযুক্তিনির্ভর শিক্ষা, সহশিক্ষা
            কার্যক্রম এবং নানাবিধ সাংস্কৃতিক ও ক্রীড়া কার্যক্রমের মাধ্যমে
            শিক্ষার্থীদের সার্বিক বিকাশে গুরুত্ব দিয়ে থাকি।
          </p>

          <p className="text-justify   leading-relaxed mb-6">
            আমরা আশা করি, সম্মানিত অভিভাবক ও শিক্ষার্থীদের সহযোগিতায় রয়েল
            একাডেমি ভবিষ্যতে আরও উন্নতি করবে এবং সমাজে একটি আদর্শ শিক্ষা
            প্রতিষ্ঠান হিসেবে নিজেকে প্রতিষ্ঠিত করবে।
          </p>

          {/* signature */}
          <p className="font-bold flex items-center gap-2 text-[var(--color-text)]">
            <IoCaretForwardOutline />
            <span>মিঃ জেরি</span>
          </p>
          <p className="text-gray-600 ml-6">উপাধ্যক্ষ, রয়েল একাডেমি</p>
        </div>
      </div>
    </section>
  );
};

export default VicePrincipal;
