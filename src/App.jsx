import React, { Suspense } from "react"
import { Route, Routes, useLocation, matchPath } from "react-router-dom"
import Footer from "./componet/Footer"
import Header from "./componet/Header"
import ScrollToTop from "./componet/Scrolltotop"
import { CartProvider } from "./contex/cartContext"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import CustomLogoLoader from "./CustomLogoLoader"
import Communitydetails from "./pages/Communitydetails"
import Donationuser from "./pages/Donationuser"
import CondolencesDetails from "./pages/Lifeevent/CondolencesDetails"
import CondolencesRequest from "./pages/Lifeevent/Condolencesrequest"
import Celebrationrequest from "./pages/Lifeevent/Celebrationrequest"
import Donationdetails from "./pages/Donationdetails"
import Donationyour from "./pages/Donationyour"
import Eventyourbook from "./pages/Eventyourbook"

// Lazy-loaded pages
const Home = React.lazy(() => import("./pages/Home"))
const Matrimony = React.lazy(() => import("./pages/Matrimony"))
const FamilyTree = React.lazy(() => import("./pages/FamilyTree"))
const JobsDetails = React.lazy(() => import("./pages/jobsdetails"))
const Recipe = React.lazy(() => import("./pages/Recipe"))
const News = React.lazy(() => import("./pages/News"))
const Gallery = React.lazy(() => import("./pages/Gallery"))
const Event = React.lazy(() => import("./pages/Event"))
const Shop = React.lazy(() => import("./pages/Shop"))
const Product = React.lazy(() => import("./Shop/Product"))
const Cart = React.lazy(() => import("./pages/Cart"))
const Addproduct = React.lazy(() => import("./Shop/Addproduct"))
const Member = React.lazy(() => import("./committe member/Member"))
const Loginn = React.lazy(() => import("./Loginn"))
const RegistrationCommittee = React.lazy(() => import("./RegistrationCommittee"))
const RegistrationUser = React.lazy(() => import("./RegistrationUser"))
const Superadmin = React.lazy(() => import("./superadmin/Superadmin"))
const Profileuser = React.lazy(() => import("./pages/Profiluser"))
const Fetureparivaar = React.lazy(() => import("./Fetureparivaar"))
const Jobs = React.lazy(() => import("./pages/Jobs"))
const JobsApply = React.lazy(() => import("./pages/jobsapply"))
const Jobposted = React.lazy(() => import("./pages/Jobposted"))
const GalleryDetails = React.lazy(() => import("./pages/Gallerydetail"))
const SetupScreen = React.lazy(() => import("./pages/Setupscreen"))
const Yourproduct = React.lazy(() => import("./Shop/Yourproduct"))
const Connect = React.lazy(() => import("./pages/Connect"))
const Lifeevents = React.lazy(() => import("./pages/Lifeevents"))
const Celebration = React.lazy(() => import("./pages/Lifeevent/Celebration"))
const CelebrationDetails = React.lazy(() => import("./pages/Lifeevent/CelebrationDetails"))
const Condolences = React.lazy(() => import("./pages/Lifeevent/Condolences"))
const Pagenotfound = React.lazy(() => import("./pages/Pagenotfound"))
const Planssparivaar = React.lazy(() => import("./Planssparivaar"))

function App() {
  const location = useLocation()

  const showHeaderFooterPatterns = [
    "/home",
    "/event",
    "/eventyourbook",
    "/matrimoney",
    "/familytree",
    "/news",
    "/connect",
    "/celebration",
    "/celebration/:id",
    "/condolences",
    "/condolences/:id",
    "/condolences/requests",
    "/celebrationrequest",
    "/lifeevent",
    "/postjob",
    "/profileuser",
    "/shop",
    "/recipe",
    "/gallery",
    "/job",
    "/job/:id",
    "/job/apply",
    "/job/posted",
    "/addproduct",
    "/yourproduct",
    "/cart",
    "/product/:id",
    "/gallery/:id",
    "/setupScreen",
    "/communitydetails",
    "/donation",
    "/donation/:id",
    "/yourdonation",
  ]

  const shouldShowHeaderFooter = showHeaderFooterPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  )

  return (
    <CartProvider>
      {shouldShowHeaderFooter && <Header />}
      <ScrollToTop />
      <Suspense fallback={<CustomLogoLoader />}>
        <Routes>
          <Route path="/communitydetails" element={<Communitydetails />} />
          <Route path="/registration-user" element={<RegistrationUser />} />
          <Route path="/registration-committee" element={<RegistrationCommittee />} />
          <Route path="/home" element={<Home />} />
          <Route path="/event" element={<Event />} />
          <Route path="/eventyourbook" element={<Eventyourbook />} />

          <Route path="/matrimoney" element={<Matrimony />} />
          <Route path="/familytree" element={<FamilyTree />} />
          <Route path="/news" element={<News />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/celebration" element={<Celebration />} />
          <Route path="/celebration/:id" element={<CelebrationDetails />} />
          <Route path="/condolences" element={<Condolences />} />
          <Route path="/condolences/:id" element={<CondolencesDetails />} />
          <Route path="/condolences/requests" element={<CondolencesRequest />} />
          <Route path="/celebrationrequest" element={<Celebrationrequest />} />
          <Route path="/donation/:id" element={<Donationdetails />} />
          <Route path="/yourdonation" element={<Donationyour />} />
          <Route path="/lifeevent" element={<Lifeevents />} />
          <Route path="/postjob" element={<JobsDetails />} />
          <Route path="/profileuser" element={<Profileuser />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/job" element={<Jobs />} />
          <Route path="/job/:id" element={<JobsDetails />} />
          <Route path="/job/apply" element={<JobsApply />} />
          <Route path="/job/posted" element={<Jobposted />} />
          <Route path="/addproduct" element={<Addproduct />} />
          <Route path="/yourproduct" element={<Yourproduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/login" element={<Loginn />} />
          <Route path="/planssparivaar" element={<Planssparivaar />} />
          <Route path="/gallery/:id" element={<GalleryDetails />} />
          <Route path="/setupScreen" element={<SetupScreen />} />
          <Route path="/donation" element={<Donationuser />} />
          <Route path="/" element={<Fetureparivaar />} />
          <Route path="/member" element={<Member />} />
          <Route path="/member/:page" element={<Member />} />
          <Route path="/superadmin" element={<Superadmin />} />
          <Route path="/*" element={<Pagenotfound />} />
        </Routes>
      </Suspense>
      {shouldShowHeaderFooter && <Footer />}
    </CartProvider>
  )
}

export default App
