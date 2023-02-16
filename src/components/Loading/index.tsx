import Loader from 'react-loading'
import './style.css'

interface LoadingProps {
  isLoading: boolean
}

const Loading: React.FC<LoadingProps> = ({
  isLoading
}) => {
  return (
    isLoading ? (
      <div className="loading-container">
        <Loader type='spinningBubbles' color='#dbeb06' width={250} height={250} />
      </div>
    ) : null
  );
}

export default Loading;