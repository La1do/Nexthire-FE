import { useCvBuilderStore } from '../store/useCvBuilderStore';

const requiredFieldClass = (value: string) =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${value.trim() === ''
        ? 'border-dashed border-red-400 focus:border-red-400'
        : 'border-[#d9d9e3] focus:border-[#f23b94]'
    }`;

export const ContentForm = () => {
    const personalInfo = useCvBuilderStore((state) => state.data.personalInfo);
    const summary = useCvBuilderStore((state) => state.data.summary);
    const updatePersonalInfo = useCvBuilderStore((state) => state.updatePersonalInfo);
    const updateSummary = useCvBuilderStore((state) => state.updateSummary);

    const experiences = useCvBuilderStore((s) => s.data.experiences);
    const addExperience = useCvBuilderStore((s) => s.addExperience);
    const updateExperience = useCvBuilderStore((s) => s.updateExperience);
    const removeExperience = useCvBuilderStore((s) => s.removeExperience);

    const educations = useCvBuilderStore((s) => s.data.educations);
    const addEducation = useCvBuilderStore((s) => s.addEducation);
    const updateEducation = useCvBuilderStore((s) => s.updateEducation);
    const removeEducation = useCvBuilderStore((s) => s.removeEducation);

    const skills = useCvBuilderStore((s) => s.data.skills);
    const addSkill = useCvBuilderStore((s) => s.addSkill);
    const updateSkill = useCvBuilderStore((s) => s.updateSkill);
    const removeSkill = useCvBuilderStore((s) => s.removeSkill);

    const activities = useCvBuilderStore((s) => s.data.activities);
    const addActivity = useCvBuilderStore((s) => s.addActivity);
    const updateActivity = useCvBuilderStore((s) => s.updateActivity);
    const removeActivity = useCvBuilderStore((s) => s.removeActivity);

    const certifications = useCvBuilderStore((s) => s.data.certifications);
    const addCertification = useCvBuilderStore((s) => s.addCertification);
    const updateCertification = useCvBuilderStore((s) => s.updateCertification);
    const removeCertification = useCvBuilderStore((s) => s.removeCertification);

    const awards = useCvBuilderStore((s) => s.data.awards);
    const addAward = useCvBuilderStore((s) => s.addAward);
    const updateAward = useCvBuilderStore((s) => s.updateAward);
    const removeAward = useCvBuilderStore((s) => s.removeAward);

    const references = useCvBuilderStore((s) => s.data.references);
    const addReference = useCvBuilderStore((s) => s.addReference);
    const updateReference = useCvBuilderStore((s) => s.updateReference);
    const removeReference = useCvBuilderStore((s) => s.removeReference);

    const interests = useCvBuilderStore((s) => s.data.interests);
    const addInterest = useCvBuilderStore((s) => s.addInterest);
    const updateInterest = useCvBuilderStore((s) => s.updateInterest);
    const removeInterest = useCvBuilderStore((s) => s.removeInterest);

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-[#111827]">Thông tin cá nhân</h3>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#374151]">Họ và tên</label>
                        <input
                            type="text"
                            value={personalInfo.fullName}
                            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                            className={requiredFieldClass(personalInfo.fullName)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#374151]">Vị trí ứng tuyển</label>
                        <input
                            type="text"
                            value={personalInfo.jobTitle}
                            onChange={(e) => updatePersonalInfo({ jobTitle: e.target.value })}
                            className={requiredFieldClass(personalInfo.jobTitle)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#374151]">Email</label>
                        <input
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                            className={requiredFieldClass(personalInfo.email)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#374151]">Số điện thoại</label>
                        <input
                            type="text"
                            value={personalInfo.phone}
                            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                            className={requiredFieldClass(personalInfo.phone)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#374151]">Địa chỉ</label>
                        <input
                            type="text"
                            value={personalInfo.address}
                            onChange={(e) => updatePersonalInfo({ address: e.target.value })}
                            className={requiredFieldClass(personalInfo.address)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-[#111827]">Mục tiêu nghề nghiệp</h3>
                <textarea
                    value={summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-md border border-[#d9d9e3] px-3 py-2 text-sm focus:border-[#f23b94] focus:outline-none"
                />
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Kinh nghiệm làm việc</h3>

                    <button
                        onClick={() =>
                            addExperience({
                                id: crypto.randomUUID(),
                                companyName: '',
                                position: '',
                                startDate: '',
                                endDate: '',
                                isCurrent: false,
                                description: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-6">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="rounded border p-4">
                            <input
                                value={exp.companyName}
                                onChange={(e) =>
                                    updateExperience(exp.id, { companyName: e.target.value })
                                }
                                placeholder="Tên công ty"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={exp.position}
                                onChange={(e) =>
                                    updateExperience(exp.id, { position: e.target.value })
                                }
                                placeholder="Vị trí"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={exp.startDate}
                                    onChange={(e) =>
                                        updateExperience(exp.id, { startDate: e.target.value })
                                    }
                                    placeholder="Bắt đầu"
                                    className="rounded border p-2"
                                />

                                <input
                                    value={exp.endDate}
                                    onChange={(e) =>
                                        updateExperience(exp.id, { endDate: e.target.value })
                                    }
                                    placeholder="Kết thúc"
                                    className="rounded border p-2"
                                />
                            </div>

                            <textarea
                                value={exp.description}
                                onChange={(e) =>
                                    updateExperience(exp.id, { description: e.target.value })
                                }
                                placeholder="Mô tả"
                                className="mt-2 w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeExperience(exp.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Học vấn</h3>

                    <button
                        onClick={() =>
                            addEducation({
                                id: crypto.randomUUID(),
                                schoolName: '',
                                major: '',
                                startDate: '',
                                endDate: '',
                                description: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-6">
                    {educations.map((edu) => (
                        <div key={edu.id} className="rounded border p-4">
                            <input
                                value={edu.schoolName}
                                onChange={(e) =>
                                    updateEducation(edu.id, { schoolName: e.target.value })
                                }
                                placeholder="Tên trường"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={edu.major}
                                onChange={(e) =>
                                    updateEducation(edu.id, { major: e.target.value })
                                }
                                placeholder="Chuyên ngành"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={edu.startDate}
                                    onChange={(e) =>
                                        updateEducation(edu.id, { startDate: e.target.value })
                                    }
                                    placeholder="Bắt đầu"
                                    className="rounded border p-2"
                                />

                                <input
                                    value={edu.endDate}
                                    onChange={(e) =>
                                        updateEducation(edu.id, { endDate: e.target.value })
                                    }
                                    placeholder="Kết thúc"
                                    className="rounded border p-2"
                                />
                            </div>

                            <textarea
                                value={edu.description}
                                onChange={(e) =>
                                    updateEducation(edu.id, { description: e.target.value })
                                }
                                placeholder="Mô tả"
                                className="mt-2 w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeEducation(edu.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Kỹ năng</h3>

                    <button
                        onClick={() =>
                            addSkill({
                                id: crypto.randomUUID(),
                                name: '',
                                level: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-4">
                    {skills.map((skill) => (
                        <div key={skill.id} className="rounded border p-4">
                            <input
                                value={skill.name}
                                onChange={(e) =>
                                    updateSkill(skill.id, {
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Tên kỹ năng"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={skill.level}
                                onChange={(e) =>
                                    updateSkill(skill.id, {
                                        level: e.target.value,
                                    })
                                }
                                placeholder="Mức độ"
                                className="w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeSkill(skill.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Hoạt động</h3>

                    <button
                        type="button"
                        onClick={() =>
                            addActivity({
                                id: crypto.randomUUID(),
                                name: '',
                                role: '',
                                startDate: '',
                                endDate: '',
                                description: '',
                            })
                        }
                        className="rounded-md bg-[#f23b94] px-3 py-2 text-sm text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="rounded-md border border-[#d9d9e3] p-4"
                        >
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Tên hoạt động"
                                    value={activity.name}
                                    onChange={(e) =>
                                        updateActivity(activity.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    className={requiredFieldClass(activity.name)}
                                />

                                <input
                                    type="text"
                                    placeholder="Vai trò"
                                    value={activity.role}
                                    onChange={(e) =>
                                        updateActivity(activity.id, {
                                            role: e.target.value,
                                        })
                                    }
                                    className={requiredFieldClass(activity.role)}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Bắt đầu"
                                        value={activity.startDate}
                                        onChange={(e) =>
                                            updateActivity(activity.id, {
                                                startDate: e.target.value,
                                            })
                                        }
                                        className={requiredFieldClass(activity.startDate)}
                                    />

                                    <input
                                        type="text"
                                        placeholder="Kết thúc"
                                        value={activity.endDate}
                                        onChange={(e) =>
                                            updateActivity(activity.id, {
                                                endDate: e.target.value,
                                            })
                                        }
                                        className={requiredFieldClass(activity.endDate)}
                                    />
                                </div>

                                <textarea
                                    rows={4}
                                    placeholder="Mô tả"
                                    value={activity.description}
                                    onChange={(e) =>
                                        updateActivity(activity.id, {
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-md border border-[#d9d9e3] px-3 py-2 text-sm focus:border-[#f23b94] focus:outline-none"
                                />

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeActivity(activity.id)}
                                        className="rounded-md bg-red-500 px-3 py-2 text-sm text-white"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Chứng chỉ</h3>

                    <button
                        onClick={() =>
                            addCertification({
                                id: crypto.randomUUID(),
                                name: '',
                                issuer: '',
                                issueDate: '',
                                description: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-6">
                    {certifications.map((cert) => (
                        <div key={cert.id} className="rounded border p-4">
                            <input
                                value={cert.name}
                                onChange={(e) =>
                                    updateCertification(cert.id, {
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Tên chứng chỉ"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={cert.issuer}
                                onChange={(e) =>
                                    updateCertification(cert.id, {
                                        issuer: e.target.value,
                                    })
                                }
                                placeholder="Đơn vị cấp"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={cert.issueDate}
                                onChange={(e) =>
                                    updateCertification(cert.id, {
                                        issueDate: e.target.value,
                                    })
                                }
                                placeholder="Ngày cấp"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <textarea
                                value={cert.description}
                                onChange={(e) =>
                                    updateCertification(cert.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Mô tả"
                                className="w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeCertification(cert.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Giải thưởng</h3>

                    <button
                        onClick={() =>
                            addAward({
                                id: crypto.randomUUID(),
                                name: '',
                                issuer: '',
                                date: '',
                                description: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-6">
                    {awards.map((award) => (
                        <div key={award.id} className="rounded border p-4">
                            <input
                                value={award.name}
                                onChange={(e) =>
                                    updateAward(award.id, {
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Tên giải thưởng"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={award.issuer}
                                onChange={(e) =>
                                    updateAward(award.id, {
                                        issuer: e.target.value,
                                    })
                                }
                                placeholder="Đơn vị cấp"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={award.date}
                                onChange={(e) =>
                                    updateAward(award.id, {
                                        date: e.target.value,
                                    })
                                }
                                placeholder="Ngày nhận"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <textarea
                                value={award.description}
                                onChange={(e) =>
                                    updateAward(award.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Mô tả"
                                className="w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeAward(award.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Người tham chiếu</h3>

                    <button
                        onClick={() =>
                            addReference({
                                id: crypto.randomUUID(),
                                name: '',
                                position: '',
                                company: '',
                                phone: '',
                                email: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-6">
                    {references.map((reference) => (
                        <div key={reference.id} className="rounded border p-4">
                            <input
                                value={reference.name}
                                onChange={(e) =>
                                    updateReference(reference.id, { name: e.target.value })
                                }
                                placeholder="Họ và tên"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={reference.position}
                                onChange={(e) =>
                                    updateReference(reference.id, { position: e.target.value })
                                }
                                placeholder="Chức vụ"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={reference.company}
                                onChange={(e) =>
                                    updateReference(reference.id, { company: e.target.value })
                                }
                                placeholder="Công ty"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                value={reference.phone}
                                onChange={(e) =>
                                    updateReference(reference.id, { phone: e.target.value })
                                }
                                placeholder="Số điện thoại"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <input
                                type="email"
                                value={reference.email}
                                onChange={(e) =>
                                    updateReference(reference.id, { email: e.target.value })
                                }
                                placeholder="Email"
                                className="mb-2 w-full rounded border p-2"
                            />

                            <button
                                onClick={() => removeReference(reference.id)}
                                className="mt-3 rounded bg-red-500 px-3 py-1 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[8px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#111827]">Sở thích</h3>

                    <button
                        onClick={() =>
                            addInterest({
                                id: crypto.randomUUID(),
                                name: '',
                            })
                        }
                        className="rounded bg-pink-500 px-3 py-1 text-white"
                    >
                        Thêm
                    </button>
                </div>

                <div className="space-y-4">
                    {interests.map((interest) => (
                        <div key={interest.id} className="flex items-center gap-3">
                            <input
                                value={interest.name}
                                onChange={(e) =>
                                    updateInterest(interest.id, {
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Nhập sở thích"
                                className="flex-1 rounded border p-2"
                            />

                            <button
                                onClick={() => removeInterest(interest.id)}
                                className="rounded bg-red-500 px-3 py-2 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};