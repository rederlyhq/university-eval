export interface QueryTest {
    name: string;
    query: string;
    description: string;
}

const universityId = -1;
// Single quotes are important! including them here in case you want to use NOW() or some other variable
const createdAfterDate = "'1/1/2021'";

export const queries: Array<QueryTest> = [
    {
        query: `
        SELECT COUNT(DISTINCT users.user_id) AS professor_count
        FROM users
        WHERE university_id = ${universityId} AND
        role_id=1 AND
        user_verified=true AND
        users.course_topic_question_active;
        `,
        name: 'Registered professors for the university',
        description: 'TODO should this include curriculum owners?',
    }, {
        query: `
        SELECT COUNT(DISTINCT student_enrollment.student_enrollment_id) as total_enrollments, SUM(CASE WHEN student_enrollment.student_enrollment_drop_date IS NULL THEN 1 ELSE 0 END) as active_enrollments
        FROM student_enrollment
        INNER JOIN course ON course.course_id = student_enrollment.course_id AND course.course_active
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active
        WHERE course.university_id = ${universityId} AND users.role_id = 0 AND course.created_at > ${createdAfterDate}
        `,
        name: 'Student enrollments in courses from the university (enrollments)',
        description: 'All student\'s enrolled in a course owned by the university'
    }, {
        query: `
        SELECT COUNT(DISTINCT student_enrollment.user_id) as student_count FROM student_enrollment
        INNER JOIN course ON course.course_id = student_enrollment.course_id AND course.course_active
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active
        WHERE course.university_id = ${universityId} AND users.role_id = 0 AND course.created_at > ${createdAfterDate};
        `,
        name: 'Registered students (number unique students enrolled in the university\'s courses)',
        description: 'The number of student\'s enrolled in a course from the university (only count once if enrolled in multiple courses)',
    // }, {
    //     query: `
    //     SELECT course.course_name, COUNT(course_topic_question.course_topic_question_id) as problem_count FROM course
    //     INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
    //     INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active
    //     INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id AND course_topic_question.course_topic_question_active
    //     INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
    //     WHERE course.course_active AND course.university_id = ${universityId}
    //     GROUP BY course.course_id, course.course_name;
    //     `,
    //     name: 'Problem count per course',
    //     description: 'The count of problems in each course'
    }, {
        query: `
        SELECT COUNT(DISTINCT course_topic_question.course_topic_question_id) as problem_count
        FROM course
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active
        INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id AND course_topic_question.course_topic_question_active
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0 AND course.created_at > ${createdAfterDate}
		WHERE course.course_active AND course.university_id = ${universityId};
        `,
        name: 'Problem count',
        description: 'The number of problems in all courses in the university'
    }, {
        query: `
        SELECT curriculum.curriculum_name, COUNT(DISTINCT course_topic_question.course_topic_question_id) as problem_count
        FROM curriculum
        INNER JOIN course ON course.curriculum_id = curriculum.curriculum_id AND course.course_active AND course.university_id = ${universityId}
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active
        INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id AND course_topic_question.course_topic_question_active
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        WHERE curriculum.curriculum_active AND curriculum.university_id = ${universityId} AND course.created_at > ${createdAfterDate}
        GROUP BY curriculum.curriculum_id, curriculum.curriculum_name;
        `,
        name: 'Number of individual problems used in model courses belonging to the university (OK if not individual - just let me know as there is likely overlap)',
        description: 'Problem count per curriculum'
    }, {
        query: `
        SELECT COUNT(DISTINCT course.course_id) as course_count
        FROM course
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        WHERE course.course_active AND course.university_id = ${universityId} and course.created_at > ${createdAfterDate};
        `,
        name: 'Number of active courses for the university (has an enrollment)',
        description: 'course count in the university'
    }, {
        query: `
        SELECT COUNT(DISTINCT course_topic_content.course_topic_content_id) as homework_count
        FROM course
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active AND course_topic_content.topic_type_id = 1
        WHERE course.course_active AND course.university_id = ${universityId} AND course.created_at > ${createdAfterDate};
        `,
        name: 'Number of homework topics in the university\'s courses',
        description: 'Count of homeworks from the university'
    }, {
        query: `
        SELECT COUNT(DISTINCT course_topic_content.course_topic_content_id) as exam_count
        FROM course
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active AND course_topic_content.topic_type_id = 2
        WHERE course.course_active AND course.university_id = ${universityId} AND course.created_at > ${createdAfterDate};
        `,
        name: 'Number of exam topics in the university\'s courses',
        description: 'Count of exams for the university'
    }, {
        query: `
        SELECT COUNT(DISTINCT student_workbook.student_workbook_id) AS workbook_count, COUNT(DISTINCT users.user_id) as student_count
        FROM student_workbook
        INNER JOIN student_grade ON student_grade.student_grade_id = student_workbook.student_grade_id
        INNER JOIN users ON users.user_id = student_grade.user_id
        INNER JOIN course_topic_question ON course_topic_question.course_topic_question_id = student_grade.course_topic_question_id
        INNER JOIN course_topic_content ON course_topic_content.course_topic_content_id = course_topic_question.course_topic_content_id
        INNER JOIN course_unit_content ON course_unit_content.course_unit_content_id = course_topic_content.course_unit_content_id
        INNER JOIN course ON course.course_id = course_unit_content.course_id
        WHERE users.role_id=0
        AND (
            course.university_id = ${universityId} OR users.university_id = ${universityId}
        )
        AND course.created_at > ${createdAfterDate}
        LIMIT 10;
        `,
        name: 'Number of workbooks (unique grade instances)',
        description: 'This is the number of workbooks that all of the university\'s student\'s or student\'s enrolled in the university have submitted (and the count of unique student\'s',
    }, {
        query: `
        SELECT COUNT(DISTINCT problem_attachment.problem_attachment_cloud_filename) as homework_count FROM course
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active
        INNER JOIN course_topic_question ON course_topic_question.course_topic_content_id = course_topic_content.course_topic_content_id AND course_topic_question.course_topic_question_active
        INNER JOIN student_grade ON student_grade.course_topic_question_id = course_topic_question.course_topic_question_id AND student_grade.student_grade_active
        INNER JOIN student_grade_problem_attachment ON student_grade_problem_attachment.student_grade_id = student_grade.student_grade_id AND student_grade_problem_attachment.student_grade_problem_attachment_active
        INNER JOIN problem_attachment ON problem_attachment.problem_attachment_id = student_grade_problem_attachment.problem_attachment_id AND problem_attachment.problem_attachment_active
        WHERE course.course_active AND course.university_id = ${universityId} AND course.created_at > ${createdAfterDate};
        `,
        name: 'Unique attachments uploaded to the university\'s courses',
        description: 'The count of all attachments for courses in the university'
    }, {
        query: `
        SELECT COUNT(DISTINCT course_topic_content.course_topic_content_id) as exported_topics_count FROM course
        INNER JOIN student_enrollment ON student_enrollment.course_id = course.course_id AND student_enrollment.student_enrollment_active AND student_enrollment.student_enrollment_drop_date IS NULL
        INNER JOIN users ON users.user_id = student_enrollment.user_id AND users.course_topic_question_active AND users.role_id = 0
        INNER JOIN course_unit_content ON course_unit_content.course_id = course.course_id AND course_unit_content.course_unit_content_active
        INNER JOIN course_topic_content ON course_topic_content.course_unit_content_id = course_unit_content.course_unit_content_id AND course_topic_content.course_topic_content_active AND course_topic_content.course_topic_content_export_url IS NOT NULL
        WHERE course.course_active AND course.university_id = ${universityId} AND course.created_at > ${createdAfterDate};
        `,
        name: 'Number of bulk PDF downloads by faculty',
        description: 'Bulk pdf export'
    // }, {
    //     query: `SELECT TRUE`,
    //     name: '',
    //     description: ''
    }
];