import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgImage from '../../assets/logo.png';
import { useAuthStore } from '../../stores/useAuthStore';
import { fetchUserProfile } from '../../utils/fetchUserProfile';
import { useUserStore } from '../../stores/useUserStore';
import { ERROR_CODES } from '../../constants/errorCodes';
// import { axiosInstance } from '../../apis/lib/axios';
import { proxyAxiosInstance } from '../../apis/lib/proxyAxios';
import axios from 'axios';
import { FaGithubAlt } from 'react-icons/fa6';

export const LoginPage: React.FC = () => {
	const [username, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const { setAccessToken } = useAuthStore();
	const { setProfile } = useUserStore();
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalMessage, setModalMessage] = useState<string>('');

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			const response = await proxyAxiosInstance.post('/members/login', {
				email: username,
				password: password,
			});

			const accessToken = response.headers['accesstoken'];

			if (accessToken) {
				setAccessToken(accessToken); // 추출한 토큰을 Zustand 스토어에 저장

				await fetchUserProfile(accessToken, setProfile, navigate); // 사용자 프로필 정보 가져오기

				navigate('/');
			} else {
				// 토큰이 없는 경우의 처리
			}
		} catch (error) {
			//axios error인지 확인, error_code 처리
			if (axios.isAxiosError(error) && error.response) {
				const errorCode = error.response.data.exceptionDto.errorCode;

				if (errorCode === ERROR_CODES.MEMBER.LOGIN_FAILED) {
					// alert(errorMsg);
					setModalMessage('이메일과 비밀번호를 확인해주세요!');
					setIsModalOpen(true); // 모달창을 열어 사용자에게 메시지 표시
				}
			}
		}
	};

	return (
		<div className='flex items-center justify-center pt-20 h-full'>
			<div className='border-solid border-2 p-6 rounded-lg'>
				<div className='flex items-center justify-center'>
					<img src={ProgImage} alt='로고 이미지' className='h-16' />
					<span className='text-3xl font-bold'>ProG</span>
				</div>
				<p className='m-2 text-center'>환영합니다!</p>
				<p className='mb-4 text-center'>당신의 프로젝트와 꿈으로 나아가보세요</p>
				<form onSubmit={handleSubmit} className='p-2'>
					<div>
						<label htmlFor='id-input' />
						<input
							id='id-input'
							type='text'
							value={username}
							onChange={(e) => setUserName(e.target.value)}
							placeholder='이메일을 입력하세요'
							className='border-solid border-2 border-gray-300 w-full p-2 m-1'
						/>
					</div>
					<div>
						<label htmlFor='pw-input' />
						<input
							id='pw-input'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='비밀번호를 입력하세요'
							className='border-solid border-2 border-gray-300 w-full p-2 m-1'
						/>
					</div>
					<button
						id='login-button'
						type='submit'
						className='w-full bg-main-color hover:bg-purple-400 text-white font-bold py-2 px-4 rounded m-1'
					>
						Login
					</button>
				</form>
				<p className='text-center'>계정이 없으신가요?</p>
				<Link to='/signup' className='text-center block underline'>
					회원가입
				</Link>
				<hr className='my-4' />
				<div className='flex'>
					<FaGithubAlt className='mt-3 w-5 h-4' />
					<a
						href={import.meta.env.VITE_REDIRECT_URI}
						className='inline-block w-full bg-white text-gray-800 py-2 ml-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 mb-2'
					>
						GitHub으로 로그인
					</a>
				</div>
				{isModalOpen && (
					<div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
						<div className='relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
							<div className='mt-3 text-center'>
								<h3 className='text-lg leading-6 font-medium text-gray-900'>{modalMessage}</h3>
								<div className='items-center px-4 py-3'>
									<button
										onClick={() => setIsModalOpen(false)}
										className='mt-3 px-4 py-2 bg-main-color text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300'
									>
										닫기
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
