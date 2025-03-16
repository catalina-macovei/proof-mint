import Services from '../components/Services'
import Footer from './Footer';
import Welcome from './Welcome'

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Welcome />
      <Services />
      <Footer />
    </div>
  )
}
export default Home;
