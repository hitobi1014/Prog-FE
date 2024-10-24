/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { axiosInstance } from '../../apis/lib/axios';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useUserStore } from '../../stores/useUserStore';
import { useParams } from 'react-router-dom';

export const techStack = {
	mystack: [] as { techCode: number }[],
};

interface Tag {
	id: number;
	detailName: string;
}

interface TechList {
	id: number;
	name: string;
}

interface TechStackProps {
	initialTags?: TechList[];
}

const TechStackChange = ({ initialTags = [] }: TechStackProps) => {
	useRequireAuth();
	const { profile } = useUserStore();
	const memberId = profile?.id;
	const { projectId } = useParams();
	const [tags, setTags] = useState<Tag[]>([]);
	const [selectedTags, setSelectedTags] = useState<TechList[]>([]);
	const [selectedValue, setSelectedValue] = useState<string>('');

	useEffect(() => {
		const fetchTags = async () => {
			try {
				const response = await axiosInstance.get('/codes/details/Tech');
				if (response.data.status === 'OK') {
					setTags(response.data.data);
				}
			} catch (error) {}
		};
		fetchTags();
	}, []);

	useEffect(() => {
		// initialTags의 변경을 감지하여 selectedTags를 업데이트
		setSelectedTags(initialTags);
	}, [initialTags]); // initialTags에 의존하도록 설정

	useEffect(() => {
		// 선택된 태그가 변경될 때 techStack.mystack 업데이트
		techStack.mystack = selectedTags.map((tag) => ({ techCode: tag.id }));
	}, [selectedTags]);

	const putTag = () => {
		const selectedTag = tags.find((tag) => tag.detailName === selectedValue);
		if (selectedTag && !selectedTags.some((tag) => tag.id === selectedTag.id)) {
			setSelectedTags((prevTags) => [...prevTags, { id: selectedTag.id, name: selectedTag.detailName }]);
			setSelectedValue('');
		}
	};

	const removeTag = async (idToRemove: number) => {
		try {
			const response = await axiosInstance.delete(`/projects/${projectId}/${memberId}/projectTech/${idToRemove}`);
			setSelectedTags((prevTags) => prevTags.filter((tag) => tag.id !== idToRemove));
		} catch (error) {}
	};

	return (
		<div>
			<div className='flex'>
				<div className='text-3xl font-bold mr-2'>기술 스택</div>
			</div>
			<hr className='my-3 border-main-color border-1' />
			<div className='h-auto w-full bg-gray-50 rounded-xl'>
				{selectedTags.map((item, index) => (
					<span
						key={index}
						className='bg-sub-color p-1 m-1 inline-block cursor-pointer rounded-2xl'
						onClick={() => removeTag(item.id)}
					>
						{item.name} X
					</span>
				))}
			</div>
			<div className='mb-10'>
				<select
					id='techStack'
					className='mt-2 p-2'
					value={selectedValue}
					onChange={(e) => setSelectedValue(e.target.value)}
				>
					<option value='default'>기술 스택 선택</option>
					{tags.map((tag, index) => (
						<option key={index} value={tag.detailName}>
							{tag.detailName}
						</option>
					))}
				</select>

				<button onClick={putTag} className='mt-5 bg-main-color text-white p-2 ml-2 rounded-lg'>
					등록
				</button>
			</div>
		</div>
	);
};

export default TechStackChange;
