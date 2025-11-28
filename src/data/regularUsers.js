// 简易中文姓名词典，用于生成演示用户
const familyNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];

const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '婷', '浩'];

const startDate = new Date('2024-01-01T00:00:00Z');

const formatDate = (date) => date.toISOString().slice(0, 10);

export const regularUsersData = Array.from({ length: 8 }, (_, index) => {
  const id = `U${String(index + 1).padStart(3, '0')}`;
  const lastName = familyNames[index % familyNames.length];
  const givenName = givenNames[Math.floor(index / familyNames.length) % givenNames.length];
  const name = `${lastName}${givenName}`;
  const email = `user${String(index + 1).padStart(3, '0')}@example.com`;
  const joinedDate = new Date(startDate);
  joinedDate.setDate(joinedDate.getDate() + index);
  const status = index % 4 === 0 ? 'inactive' : 'active';

  return {
    id,
    name,
    email,
    status,
    joinedAt: formatDate(joinedDate),
  };
});
