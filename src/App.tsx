import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css'
import api from './services/api';
import Webcam from 'react-webcam'
import { toast } from 'react-toastify';
import Loading from './components/Loading';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [products, setProducts] = useState([])
  const [cameraIsOpen, setCameraIsOpen] = useState(false)
  const [createProductIsOpen, setCreateProductIsOpen] = useState(false)

  const [productId, setProductId] = useState('')
  const [productName, setProductName] = useState('')
  const [productImages, setProductImages] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const webcamRef = useRef<any>(null)

  function dataURLtoFile(dataurl: any, filename: any) {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }

  const getSimilaryProducts = async (file: any) => {
    setIsLoading(true)
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('productSet', 'geral')

    try {
      const { data: products } = await api.post('/getProducts', form)

      if (products?.length) {
        setProducts(products)
      } else {
        toast.error('Nenhum produto encontrado!')
        setSelectedFile([] as any)
        setProducts([])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTakePicture = useCallback(async () => {
    const picture = webcamRef?.current?.getScreenshot()
    const file = dataURLtoFile(picture, 'file.jpg')
    setCameraIsOpen(false)
    getSimilaryProducts(file)
  }, [webcamRef])

  const handleCreateProduct = useCallback(async () => {
    setIsLoading(true)
    const form = new FormData()
    form.append('productId', productId)
    form.append('productName', productName)
    if (productImages?.length) {
      productImages.forEach(file => {
        form.append('file', file)
      })
    }
    form.append('productSetId', 'geral')

    try {
      const { status } = await api.post('/createProduct', form)

      if (status === 200) {
        toast.success('Produto criado com sucesso, aguarde alguns minutos até que o produto seja indexado.')
        setProductId('')
        setProductName('')
        setProductImages([])
        setCreateProductIsOpen(false)
        return
      } else {
        return toast.error('Erro ao criar produto, tente novamente!')
      }
    } catch (error) {
      console.log(error)
      return toast.error('Erro ao criar produto, tente novamente!')
    } finally {
      setIsLoading(false)
    }
  }, [productId, productName, productImages])

  useEffect(() => {
    if (!selectedFile) return
    getSimilaryProducts(selectedFile)
  }, [selectedFile])

  return (
    <>
      <div className="container">
        {!createProductIsOpen ? (
          <div className="content-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {!cameraIsOpen ? (
              <>
                <input type="file" onChange={(e: any) => setSelectedFile(e?.target?.files[0])} accept=".png, .jpg, .jpeg"/>
                <button
                  onClick={() => {
                    setProducts([])
                    setCreateProductIsOpen(true)
                  }}
                >
                  Criar produto
                </button>
                <button onClick={() => setCameraIsOpen(true)}>Foto</button>
                {products?.length ? <strong>Produtos relacionados</strong> : ''}
                <div style={{ display: 'flex', gap: '1rem', maxWidth: '100%', overflowX: 'auto' }}>
                  {products?.length ? products?.map((product: any, index: any) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem', border: '1px solid #FFF', padding: '.5rem', borderRadius: '5px' }}>
                      <span>
                        {product?.product?.displayName}
                      </span>
                      <img src={product?.image} alt="Imagem"  width={200} height={200} />
                      <span>
                        Similaridade: {Math.ceil(product?.score * 100)}%
                      </span>
                    </div>
                  )) : null}
                </div>
                {products?.length ? <button style={{ width: '200px' }} onClick={() => {
                  setProducts([])
                  setSelectedFile(null)
                }}>Limpar produtos</button> : ''}
              </>
            ) : (
              <>
                <Webcam
                  audio={false}
                  height={800}
                  width={800}
                  screenshotFormat="image/jpeg"
                  ref={webcamRef}
                />
                <div style={{ width: '100%', display: 'flex', gap: '2rem' }}>
                  <button style={{ width: '100%' }} onClick={() => setCameraIsOpen(false)}>Voltar</button>
                  <button style={{ width: '100%' }} onClick={() => handleTakePicture()}>Tirar foto</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="content-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input type="text" placeholder='Product id' value={productId} onChange={(e) => setProductId(e.target.value) }/>
            <input type="text" placeholder='Product name' value={productName} onChange={(e) => setProductName(e.target.value) }/>
            <input type="file" multiple={true} onChange={(e) => setProductImages(Array.from(e?.target?.files as any)) }/>
            <div style={{ width: '100%', gap: '.5rem', display: 'flex'}}>
              <button 
                type="button" 
                style={{ width: '100%' }}
                onClick={() => {
                  setProductId('')
                  setProductName('')
                  setProductImages([])
                  setCreateProductIsOpen(false)
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.preventDefault()
                  handleCreateProduct()
                }}
              >
                Criar
              </button>
            </div>
          </div>
        )}
      </div>
      <Loading isLoading={isLoading} />
    </>
  )
}

export default App;