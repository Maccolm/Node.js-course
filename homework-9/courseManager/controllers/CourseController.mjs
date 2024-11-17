import CourseDBService from "../models/CourseDBService.mjs"
import StudentDBService from '../models/StudentDBService.mjs'
import { validationResult } from 'express-validator';


class CourseController {
	static async getList(req, res) {
		try {
			const filters = {}
			for (const key in req.query) {
				if(req.query[key]) filters[key] = req.query[key]
			}
			const courses = await CourseDBService.getList(filters, null, ['students', 'seminars.responsibleStudent'])

			console.log(courses);
			
			return res.render('courses/generalList', {
				pageTitle: 'Courses',
				headerTitle: 'List of Courses',
				fields: { title: 'Title', duration: 'Duration' },
				data: courses,
				addNewRoute: 'courses/register',
				addNewStudent: 'students/register',
				editLinkBase: '/courses/register',
				deleteRoute: '/courses',
				message: courses && courses.length === 0 ? 'List is empty, create a course' : null
			})
		} catch (err) {
			console.error(err)
			res.status(500).json({ error: err.message })
		}
	}

	static async registerForm(req, res) {
		try {
			const id = req.params.id
			let courseItem = {}
			if (id) {
				courseItem = await CourseDBService.getById(id, ['students', 'seminars.responsibleStudent'])
			} 
			const students = await StudentDBService.getList()
			res.render('general/generalEditForm', {
				pageTitle: 'Course Form',
				headerTitle: id ? 'Edit Course' : 'Create Course',
				fields: [
					{ name: 'title', type: 'text', required: true, label: 'Title' },
					{ name: 'duration', type: 'number', required: true, label: 'Duration (hours)' },
					{ name: 'students', type: 'select', multiple: true, options: students, label: 'Select Students' },
				],
				initialValues: courseItem,
				errors: [],
				submitUrl: '/courses/register' + (id ? `/${id}` : ''),
				redirectUrl: '/courses',
			})
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}

	static async register(req, res) {
		const errors = validationResult(req)
		const data = req.body
		if(!errors.isEmpty()) {
			if (req.params.id) data.id = req.params.id
			return  res.status(400).render('general/generalEditForm', {
				pageTitle: 'Course Form',
				headerTitle: req.params.id ? 'Edit course' : 'Create course',
				fields: [
					{ name: 'title', type: 'text', required: true, label: 'Title' },
					{ name: 'duration', type: 'number', required: true, label: 'Duration (hours)' },
				],
				initialValues: data,
				errors: errors.array(),
				submitUrl: '/courses/register' + (req.params.id ? `/${req.params.id}` : ''),
				redirectUrl: '/courses',
			})
		}
		try {
			const { title, duration, students } = req.body
			const dataObj = { title, duration, students }
			if (req.params.id) {
				await CourseDBService.update(req.params.id, dataObj)
			} else {
				await CourseDBService.create(dataObj)
			}
			res.redirect('/courses')
		} catch (err) {
			res.status(500).render('general/generalEditForm', {
				pageTitle: 'Course Form',
				headerTitle: req.params.id ? 'Edit Course' : 'Create Course',
				fields: [
					{ name: 'title', type: 'text', required: true, label: 'Title' },
					{ name: 'duration', type: 'number', required: true, label: 'Duration (hours)' },
				],
				initialValues: data,
				errors: [{ msg: err.message }],
				submitUrl: '/courses/register' + (req.params.id ? `/${req.params.id}` : ''),
				redirectUrl: '/courses',
			})
		}
	}

	static async delete(req, res) {
		try {
			await CourseDBService.deleteById(req.body.id)
			res.json({ success: true })
		} catch (error) {
			res.status(500).json({ success: false, message: 'Failed to delete course' })
		}
	}
}
export default CourseController 