import Image from "next/image";
import Link from "next/link";
import SignUpForm from "../components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="grid grid-col-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 flex flex-col gap-4 items-center justify-center">
          <Link
            href={"/"}
            className="shadow-md rounded-md overflow-hidden w-fit hover:cursor-pointer hover:scale-95 hover:shadow-sm transition-all duration-200"
          >
            <Image
              src={"/infinite-assets/InfiniteForcesIcon.webp"}
              alt="Infinite Forces Icon"
              height={50}
              width={50}
            />
          </Link>
          <div className="max-w-md w-full bg-white rounded-2xl p-0">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Infinite-Forces
              </h1>
              <p className="text-gray-600">The all-in-one automation tool for modern wellness professionals.</p>
            </div>

            <SignUpForm/>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
              Already have an account?{" "}
                <Link
                  href="/"
                  className="text-[#242424] underline font-medium hover:text-gray-600"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="absolute top-0 left-0 w-16 h-16 bg-white rounded-br-3xl z-10"></div>

          <div className="h-[600px] relative w-full rounded-3xl overflow-hidden">
            {/* Replace with your vibrant, motion-blurred portrait image */}
            <Image
              src={"/assets/img/sign-up-cover.webp"}
              alt="vibrant portrait signin cover"
              fill
              className="object-cover"
            />
          </div>

          {/* Bottom-right curved cutout */}
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-tl-3xl z-10"></div>
        </div>
      </div>
    </div>
  );
}


